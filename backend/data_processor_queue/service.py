from fastapi import Depends
from data_processor_queue import dpq
from rq import Retry

from settings import apperture_settings


class DPQueueService:
    def __init__(self, settings=Depends(apperture_settings)):
        self.settings = settings

    def enqueue(self, datasource_id) -> str:
        retry = (
            None
            if self.settings.fastapi_env == "development"
            else Retry(max=3, interval=60)
        )
        job = dpq.enqueue(
            "main.process_data_for_datasource",
            datasource_id,
            retry=retry,
            job_timeout=1800,  # 30 mins
        )
        return job.id
