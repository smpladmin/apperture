import logging
import os
from datetime import datetime, timedelta
from typing import List

from beanie import PydanticObjectId
from beanie.operators import In
from dateutil.parser import parse
from dateutil.relativedelta import relativedelta
from fastapi import Depends

from domain.datasources.models import DataSource
from domain.runlogs.models import DummyRunLog, RunLog, RunLogStatus
from mongo.mongo import Mongo


class RunLogService:
    def __init__(self, mongo: Mongo = Depends()):
        self.mongo = mongo

    async def update(self, datasource_id: str, date: datetime, status: RunLogStatus):
        runlog = await RunLog.find_one(
            RunLog.datasource_id == PydanticObjectId(datasource_id),
            RunLog.date == date,
        )
        if not runlog:
            return
        runlog.status = status
        await runlog.save()
        return runlog

    async def update_runlog(self, id: str, status: RunLogStatus):
        runlog = await RunLog.get(id)
        runlog.status = status
        await runlog.save()
        return runlog

    async def get_runlog_events(self, id: str) -> List[str]:
        runlog = await RunLog.get(id)
        return runlog.events

    async def create_runlogs(self, datasource_id: PydanticObjectId):
        today = datetime.utcnow()
        max_runlog_days = int(os.getenv("MAX_RUNLOG_DAYS", 2))
        dates = [
            (today - relativedelta(days=d)).replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )
            for d in range(1, max_runlog_days + 1)
        ]
        runlogs = [
            RunLog(datasource_id=datasource_id, date=d, status=RunLogStatus.SCHEDULED)
            for d in dates
        ]
        for runlog in runlogs:
            runlog.updated_at = runlog.created_at
        await RunLog.insert_many(runlogs)
        return await RunLog.find(RunLog.datasource_id == datasource_id).to_list()

    async def create_runlogs_with_events(
        self, datasource_id: PydanticObjectId, events: List[str] = []
    ):
        today = datetime.utcnow()
        max_runlog_days = int(os.getenv("MAX_RUNLOG_DAYS", 2))
        dates = [
            (today - relativedelta(days=d)).replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )
            for d in range(1, max_runlog_days + 1)
        ]
        runlogs = [
            RunLog(
                datasource_id=datasource_id,
                date=d,
                status=RunLogStatus.SCHEDULED,
                events=events,
            )
            for d in dates
        ]
        for runlog in runlogs:
            runlog.updated_at = runlog.created_at
        await RunLog.insert_many(runlogs)
        return await RunLog.find(
            RunLog.datasource_id == datasource_id, RunLog.events == events
        ).to_list()

    async def create_runlogs_with_events_and_dates(
        self,
        datasource_id: PydanticObjectId,
        start_date: str,
        end_date: str,
        events: List[str] = [],
    ):
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")

        dates = [
            (start + timedelta(days=x)).replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )
            for x in range(0, (end - start).days + 1)
        ]

        runlogs = [
            RunLog(
                datasource_id=datasource_id,
                date=d,
                status=RunLogStatus.SCHEDULED,
                events=events,
            )
            for d in dates
        ]
        for runlog in runlogs:
            runlog.updated_at = runlog.created_at
        await RunLog.insert_many(runlogs)
        return await RunLog.find(
            RunLog.datasource_id == datasource_id, RunLog.events == events
        ).to_list()

    async def create_pending_api_runlogs(self, datasource_id: PydanticObjectId):
        today = datetime.utcnow()
        max_runlog_days = int(os.getenv("MAX_REFRESH_DAYS", 7))
        dates = [
            (today - relativedelta(days=d)).replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )
            for d in range(1, max_runlog_days + 1)
        ]
        runlogs = [
            RunLog(datasource_id=datasource_id, date=d, status=RunLogStatus.SCHEDULED)
            for d in dates
        ]
        for runlog in runlogs:
            runlog.updated_at = runlog.created_at
        insert_response = await RunLog.insert_many(runlogs)
        return await RunLog.find(In(RunLog.id, insert_response.inserted_ids)).to_list()

    async def create_pending_runlogs(self, datasource: DataSource):
        yesterday = (datetime.utcnow() - relativedelta(days=1)).replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )
        if not datasource.provider.supports_runlogs():
            return [
                DummyRunLog(
                    datasource_id=datasource.id,
                    date=yesterday,
                    status=RunLogStatus.SCHEDULED,
                )
            ]
        return await self._runlogs_for_supported_provider(datasource, yesterday)

    async def _runlogs_for_supported_provider(self, datasource, yesterday):
        runlog_count = await RunLog.find(RunLog.datasource_id == datasource.id).count()
        if not runlog_count:
            return await self.create_runlogs(datasource.id)
        fetch_condition = [
            RunLog.datasource_id == datasource.id,
            In(RunLog.status, [RunLogStatus.FAILED, RunLogStatus.SCHEDULED]),
        ]
        failed_runlogs = await RunLog.find(*fetch_condition).to_list()
        runlogs = [
            RunLog(
                datasource_id=datasource.id,
                date=r.date,
                status=RunLogStatus.SCHEDULED,
            )
            for r in failed_runlogs
        ]
        missing_runlogs = await self.get_missing_runlogs(datasource, yesterday)
        runlogs.extend(missing_runlogs)

        if not yesterday in [r.date for r in runlogs]:
            runlogs.append(
                RunLog(
                    datasource_id=datasource.id,
                    date=yesterday,
                    status=RunLogStatus.SCHEDULED,
                )
            )

        for runlog in runlogs:
            runlog.updated_at = runlog.created_at

        async with await self.mongo.client.start_session() as s:
            async with s.start_transaction():
                await RunLog.find(*fetch_condition).set(
                    {RunLog.status: RunLogStatus.RESCHEDULED}
                )
                result = await RunLog.insert_many(runlogs)

        for id, r in zip(result.inserted_ids, runlogs):
            r.id = id
        return runlogs

    async def get_missing_runlogs(self, datasource, yesterday):
        latest_runlog_list = (
            await RunLog.find(RunLog.datasource_id == datasource.id)
            .sort("-date")
            .limit(1)
            .to_list()
        )
        if not latest_runlog_list:
            return []
        [latest_runlog] = latest_runlog_list
        number_of_runlogs_not_found = (yesterday - latest_runlog.date).days
        dates = [
            (yesterday - relativedelta(days=d)).replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )
            for d in range(1, number_of_runlogs_not_found)
        ]
        return [
            RunLog(datasource_id=datasource.id, date=d, status=RunLogStatus.SCHEDULED)
            for d in dates
        ]
