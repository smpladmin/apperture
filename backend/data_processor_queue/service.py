from datetime import timedelta
import logging
from typing import Union
from fastapi import Depends
from data_processor_queue import dpq, scheduler
from rq import Retry
from domain.common.models import IntegrationProvider

from settings import apperture_settings
from domain.runlogs.models import DummyRunLog, RunLog


class DPQueueService:
    def __init__(self, settings=Depends(apperture_settings)):
        self.settings = settings
        self.retry_70_mins = (
            None
            if self.settings.fastapi_env == "development"
            else Retry(max=3, interval=4200)
        )
        self.retry_5_mins = (
            None
            if self.settings.fastapi_env == "development"
            else Retry(max=3, interval=300)
        )
        self.job_timeout = 60 * 60 * 10  # 10 hours

    def enqueue(self, datasource_id) -> str:
        job = dpq.enqueue(
            "main.process_data_for_datasource",
            datasource_id,
            retry=self.retry_70_mins,
            job_timeout=self.job_timeout,
        )
        return job.id

    def enqueue_events_fetch_job(
        self, datasource_id: str, runlog_id: str, date: str
    ) -> str:
        job = dpq.enqueue(
            "main.process_event_data_for_datasource",
            datasource_id,
            runlog_id,
            date,
            retry=self.retry_70_mins,
            job_timeout=self.job_timeout,
        )
        return job.id

    def enqueue_user_notification(self, user_id: str):
        job = dpq.enqueue(
            "main.send_notification",
            user_id,
            retry=self.retry_5_mins,
            job_timeout=self.job_timeout,
        )
        return job.id

    def enqueue_from_runlogs(
        self,
        runlogs: list[RunLog],
    ) -> list[str]:
        return [
            self.enqueue_events_fetch_job(
                str(r.datasource_id), str(r.id), r.date.strftime("%Y-%m-%d")
            )
            for r in runlogs
        ]

    def enqueue_from_dummy_runlogs(self, runlogs: list[DummyRunLog]):
        return [self.enqueue(str(r.datasource_id)) for r in runlogs]

    def enqueue_for_provider(
        self,
        provider: IntegrationProvider,
        runlogs: Union[list[RunLog], list[DummyRunLog]],
    ):
        if provider.supports_runlogs():
            return self.enqueue_from_runlogs(runlogs)
        else:
            return self.enqueue_from_dummy_runlogs(runlogs)

    def enqueue_notification(self, notification_id):
        job = dpq.enqueue(
            "main.process_notification",
            notification_id,
            retry=self.retry_70_mins,
            job_timeout=self.job_timeout,
        )
        return job.id

    def schedule_data_processing(
        self,
        job_name: str,
        cron: str,
        name: str,
        description: str,
        args,
    ):
        logging.info(args)
        job = scheduler.cron(
            cron,
            job_name,
            args=args,
            meta={
                "cron": cron,
                "name": name,
                "description": description,
            },
        )
        return {
            "id": job.id,
            "cron": cron,
            "name": name,
            "description": description,
            "job_description": job.description,
        }

    def get_scheduled_jobs(self):
        jobs = scheduler.get_jobs()
        return [
            {
                "id": job.id,
                "cron": job.meta["cron"],
                "name": job.meta["name"],
                "description": job.meta["description"],
                "job_description": job.description,
            }
            for job in jobs
        ]

    def cancel_job(self, id):
        scheduler.cancel(id)
