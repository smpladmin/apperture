from fastapi import APIRouter, Depends
from data_processor_queue.service import DPQueueService
from rest.dtos.schedules import ScheduleJobForDatasourceDto

from rest.middlewares import validate_api_key

router = APIRouter(
    tags=["schedules"],
    dependencies=[Depends(validate_api_key)],
    responses={401: {}},
)


@router.get("/schedules")
async def get_scheduled_jobs(dpq_service: DPQueueService = Depends()):
    return dpq_service.get_scheduled_jobs()


@router.post("/schedules")
async def schedule_data_processing(
    dto: ScheduleJobForDatasourceDto, dpq_service: DPQueueService = Depends()
):
    job = dpq_service.schedule_data_processing(
        dto.job_name, dto.cron, dto.name, dto.description, dto.args
    )
    return job


@router.delete("/schedules/{id}")
async def cancel_job(id: str, dpq_service: DPQueueService = Depends()):
    dpq_service.cancel_job(id)
