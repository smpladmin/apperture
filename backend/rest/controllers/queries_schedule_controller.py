from fastapi import APIRouter, Depends

from domain.queries_schedule.service import QueriesScheduleService
from rest.dtos.queries_schedule import (
    QueriesScheduleResponse,
    QueryScheduleDto,
)
from rest.middlewares import validate_jwt

router = APIRouter(
    tags=["queries_schedule"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post(
    "/queries/schedules",
    response_model=QueriesScheduleResponse,
)
async def save_queries_schedules(
    dto: QueryScheduleDto,
    query_schedule_service: QueriesScheduleService = Depends(),
):
    query_schedule = query_schedule_service.build_queries_schedule(dto=dto)
    return await query_schedule_service.save_queries_schedule(schedule=query_schedule)


@router.get(
    "/queries/schedules/{id}",
    response_model=QueriesScheduleResponse,
)
async def get_saved_queries(
    id: str,
    query_schedule_service: QueriesScheduleService = Depends(),
):
    return await query_schedule_service.get_queries_schedule_data(id=id)
