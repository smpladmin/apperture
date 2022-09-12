from fastapi import APIRouter, Depends
from rest.dtos.data_processor import DataProcessorEnqueueDto
from rq import Retry

from rest.middlewares import validate_api_key
from data_processor_queue import dpq


router = APIRouter(
    tags=["dataprocessor"],
    dependencies=[Depends(validate_api_key)],
    responses={401: {}},
)


@router.post("/dataprocessor/enqueue")
async def update_edges(dto: DataProcessorEnqueueDto = None):
    jobs = [
        dpq.enqueue(
            "main.process_data_for_datasource",
            ds_id,
            retry=Retry(max=3, interval=60),
            job_timeout=1800,  # 30 mins
        ).id
        for ds_id in dto.datasourceIds
    ]
    return {"submitted": True, "scheduled_jobs": jobs}
