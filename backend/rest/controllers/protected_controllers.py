from typing import List

from fastapi import APIRouter, Depends
from domain.funnels.service import FunnelsService
from domain.metrics.service import MetricService
from rest.dtos.funnels import FunnelResponse, FunnelTrendResponse, TransientFunnelDto
from rest.dtos.metrics import (
    ComputedMetricStepResponse,
    MetricsComputeDto,
    SavedMetricResponse,
)

from rest.middlewares import validate_frontend_key

router = APIRouter(
    tags=["protected"],
    dependencies=[Depends(validate_frontend_key)],
    responses={401: {}},
    prefix="/protected",
)


@router.get("/metrics/{id}", response_model=SavedMetricResponse)
async def get_metric_by_id(
    id: str,
    metric_service: MetricService = Depends(),
):
    return await metric_service.get_metric_by_id(metric_id=id)


@router.post("/metrics/compute", response_model=List[ComputedMetricStepResponse])
async def compute_metrics(
    dto: MetricsComputeDto,
    metric_service: MetricService = Depends(),
):
    if metric_service.validate_formula(
        dto.function, [aggregate.variable for aggregate in dto.aggregates]
    ):
        result = await metric_service.compute_metric(
            datasource_id=str(dto.datasourceId),
            function=dto.function,
            aggregates=dto.aggregates,
            breakdown=dto.breakdown,
            date_filter=dto.dateFilter,
            segment_filter=dto.segmentFilter,
        )
        return result
    return [
        ComputedMetricStepResponse(name=func, series=[])
        for func in dto.function.split(",")
    ]


@router.get("/funnels/{id}", response_model=FunnelResponse)
async def get_saved_funnel(
    id: str,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.get_funnel(id)


@router.post("/funnels/trends/transient", response_model=List[FunnelTrendResponse])
async def get_transient_funnel_trends(
    dto: TransientFunnelDto,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.get_funnel_trends(
        datasource_id=dto.datasourceId,
        steps=dto.steps,
        date_filter=dto.dateFilter,
        conversion_window=dto.conversionWindow,
    )
