from datetime import timedelta
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
        self.retry = (
            None
            if self.settings.fastapi_env == "development"
            else Retry(max=3, interval=60)
        )
        self.job_timeout = 1800  # 30 mins

    def enqueue(self, datasource_id) -> str:
        job = dpq.enqueue(
            "main.process_data_for_datasource",
            datasource_id,
            retry=self.retry,
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
            retry=self.retry,
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
            retry=self.retry,
            job_timeout=self.job_timeout,
        )
        return job.id

    def schedule_test(self, datasource_id: str):
        job = scheduler.enqueue_in(
            timedelta(minutes=1),
            "main.process_data_for_datasource",
            datasource_id,
        )
        return {"id": job.id, "status": job.get_status()}

    def get_scheduled_jobs(self):
        jobs = scheduler.get_jobs(with_times=True)
        return [{"id": job.id, "scheduled_for": time} for (job, time) in jobs]
