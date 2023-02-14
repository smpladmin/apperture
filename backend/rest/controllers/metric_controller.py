from fastapi import APIRouter, Depends
from typing import List, Optional, Union
from domain.apperture_users.models import AppertureUser
from rest.dtos.apperture_users import AppertureUserResponse
from rest.middlewares import validate_jwt, get_user, get_user_id
from rest.dtos.metrics import (
    MetricWithUser,
    MetricsComputeResponse,
    MetricsComputeDto,
    CreateMetricDTO,
    SavedMetricResponse,
)
from domain.datasources.service import DataSourceService
from domain.metrics.service import MetricService

router = APIRouter(
    tags=["metrics"], dependencies=[Depends(validate_jwt)], responses={401: {}}
)


@router.post("/metrics/compute", response_model=MetricsComputeResponse)
async def compute_metrics(
    dto: MetricsComputeDto,
    metric_service: MetricService = Depends(),
):
    result = await metric_service.compute_metric(
        datasource_id=str(dto.datasourceId),
        function=dto.function,
        aggregates=dto.aggregates,
        breakdown=dto.breakdown,
        start_date=dto.startDate,
        end_date=dto.endDate,
    )
    return result


@router.post("/metrics", response_model=SavedMetricResponse)
async def save_metrics(
    dto: CreateMetricDTO,
    user: AppertureUser = Depends(get_user),
    metric_service: MetricService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(str(dto.datasourceId))
    return await metric_service.add_metric(
        datasource_id=dto.datasourceId,
        app_id=datasource.app_id,
        user_id=user.id,
        name=dto.name,
        function=dto.function,
        aggregates=dto.aggregates,
        breakdown=dto.breakdown,
    )


@router.put("/metrics/{id}", response_model=SavedMetricResponse)
async def save_metrics(
    id: str,
    dto: CreateMetricDTO,
    user: AppertureUser = Depends(get_user),
    metric_service: MetricService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(str(dto.datasourceId))
    metric = await metric_service.build_metric(
        datasource_id=dto.datasourceId,
        app_id=datasource.app_id,
        user_id=user.id,
        name=dto.name,
        function=dto.function,
        aggregates=dto.aggregates,
        breakdown=dto.breakdown,
    )
    await metric_service.update_metric(metric_id=id, metric=metric)
    return metric


@router.get(
    "/metrics",
    response_model=Union[
        List[MetricWithUser],
        List[SavedMetricResponse],
    ],
)
async def get_all_metrics(
    datasource_id: Union[str, None] = None,
    app_id: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    user: AppertureUser = Depends(get_user),
    metric_service: MetricService = Depends(),
):
    if app_id:
        return await metric_service.get_metrics_by_app_id(app_id=app_id)
    metrics = (
        await metric_service.get_metrics_for_datasource_id(datasource_id=datasource_id)
        if datasource_id
        else await metric_service.get_metrics_by_user_id(user_id=user_id)
    )
    metrics = [MetricWithUser.from_orm(m) for m in metrics]
    for metric in metrics:
        metric.user = AppertureUserResponse.from_orm(user)
    return metrics


@router.get("/metrics/{id}", response_model=SavedMetricResponse)
async def get_metric_by_id(
    id: str,
    metric_service: MetricService = Depends(),
):
    return await metric_service.get_metric_by_id(metric_id=id)
