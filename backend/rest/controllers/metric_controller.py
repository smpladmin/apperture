from fastapi import APIRouter,Depends
from rest.middlewares import validate_jwt
from rest.dtos.metrics import MetricsComputeResponse, MetricsComputeDto
from domain.metrics.service import MetricService

router = APIRouter(
    tags=["metrics"],
    dependencies=[Depends(validate_jwt)],
    responses={401:{}}
)

@router.post("/metrics/compute", response_model=MetricsComputeResponse)
async def compute_metrics(
    dto: MetricsComputeDto,
    metric_service: MetricService = Depends(),
):
    return await metric_service.compute_metric(
        datasource_id=dto.datasource_id,
        function=dto.function,
        aggregates=dto.aggregates,
        breakdown=dto.breakdown,
    )