from fastapi import Depends
from data_processor_queue import dpq
from rq import Retry

from settings import apperture_settings


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

    def enqueue_events_fetch_job(self, datasource_id: str, date: str) -> str:
        job = dpq.enqueue(
            "main.process_event_data_for_datasource",
            datasource_id,
            date,
            retry=self.retry,
            job_timeout=self.job_timeout,
        )
        return job.id
