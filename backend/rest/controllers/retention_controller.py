from fastapi import APIRouter, Depends

from domain.retention.service import RetentionService
from rest.dtos.retention import TransientRetentionDto, ComputedRetentionTrendResponse

from rest.middlewares import validate_jwt

router = APIRouter(
    tags=["retention"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/retention/transient", response_model=ComputedRetentionTrendResponse)
async def compute_transient_retention_trend(
    dto: TransientRetentionDto,
    retention_service: RetentionService = Depends(),
):
    return await retention_service.compute_retention(
        datasource_id=str(dto.datasourceId),
        start_event=dto.startEvent,
        goal_event=dto.goalEvent,
        granularity=dto.granularity,
        trend_scale=dto.trendScale,
        segment_filter=dto.segmentFilter,
        date_filter=dto.dateFilter,
        interval=dto.interval,
    )
