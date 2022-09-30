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
    jobs = dpq_service.get_scheduled_jobs()
    print(jobs)
    return jobs


@router.post("/schedules")
async def update_edges(
    dto: ScheduleJobForDatasourceDto, dpq_service: DPQueueService = Depends()
):
    job = dpq_service.schedule_test(dto.datasource_id)
    print(job)
