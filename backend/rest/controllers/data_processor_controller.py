from fastapi import APIRouter, Depends
from data_processor_queue.service import DPQueueService
from rest.dtos.data_processor import DataProcessorEnqueueDto

from rest.middlewares import validate_api_key


router = APIRouter(
    tags=["dataprocessor"],
    dependencies=[Depends(validate_api_key)],
    responses={401: {}},
)


@router.post("/dataprocessor/enqueue")
async def enqueue_datasources(
    dto: DataProcessorEnqueueDto = None,
    dpq_service: DPQueueService = Depends(),
):
    jobs = [dpq_service.enqueue(ds_id) for ds_id in dto.datasourceIds]
    return {"submitted": True, "scheduled_jobs": jobs}
