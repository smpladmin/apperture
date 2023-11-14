from typing import List, Optional, Union

from fastapi import APIRouter, Depends

from domain.apperture_users.models import AppertureUser
from domain.apperture_users.service import AppertureUserService
from domain.apps.service import AppService
from domain.datasources.service import DataSourceService
from domain.metrics.service import MetricService
from domain.notifications.service import NotificationService
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.metrics import (
    ComputedMetricStepResponse,
    CreateMetricDTO,
    MetricFormulaDto,
    MetricsComputeDto,
    MetricWithUser,
    SavedMetricResponse,
)
from rest.middlewares import get_user, get_user_id, validate_jwt
from rest.middlewares.validate_app_user import validate_app_user, validate_library_items

router = APIRouter(
    tags=["metrics"], dependencies=[Depends(validate_jwt)], responses={401: {}}
)


@router.post(
    "/metrics/compute",
    response_model=List[ComputedMetricStepResponse],
    dependencies=[Depends(validate_app_user)],
)
async def compute_metrics(
    dto: MetricsComputeDto,
    metric_service: MetricService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    if metric_service.validate_formula(
        dto.function, [aggregate.variable for aggregate in dto.aggregates]
    ):
        ds = await ds_service.get_datasource(dto.datasourceId)
        result = await metric_service.compute_metric(
            datasource_id=str(dto.datasourceId),
            app_id=str(ds.app_id),
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


@router.post(
    "/metrics",
    response_model=SavedMetricResponse,
    dependencies=[Depends(validate_app_user)],
)
async def save_metrics(
    dto: CreateMetricDTO,
    user: AppertureUser = Depends(get_user),
    metric_service: MetricService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(str(dto.datasourceId))
    metric = await metric_service.build_metric(
        datasource_id=datasource.id,
        app_id=datasource.app_id,
        user_id=user.id,
        name=dto.name,
        function=dto.function,
        aggregates=dto.aggregates,
        breakdown=dto.breakdown,
        date_filter=dto.dateFilter,
        segment_filter=dto.segmentFilter,
    )
    return await metric_service.add_metric(metric=metric)


@router.put(
    "/metrics/{id}",
    response_model=SavedMetricResponse,
    dependencies=[Depends(validate_app_user)],
)
async def update_metric(
    id: str,
    dto: CreateMetricDTO,
    user: AppertureUser = Depends(get_user),
    metric_service: MetricService = Depends(),
    ds_service: DataSourceService = Depends(),
    notification_service: NotificationService = Depends(),
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
        date_filter=dto.dateFilter,
        segment_filter=dto.segmentFilter,
    )
    await metric_service.update_metric(metric_id=id, metric=metric)

    ## delete any notification associated with the metric upon updating it
    await notification_service.fetch_and_delete_notification(
        reference_id=id, datasource_id=str(datasource.id)
    )
    return metric


@router.get(
    "/metrics",
    response_model=Union[
        List[MetricWithUser],
        List[SavedMetricResponse],
    ],
    dependencies=[Depends(validate_app_user)],
)
async def get_all_metrics(
    datasource_id: Union[str, None] = None,
    app_id: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    metric_service: MetricService = Depends(),
    user_service: AppertureUserService = Depends(),
):
    if app_id:
        metrics = await metric_service.get_metrics_by_app_id(app_id=app_id)
    elif datasource_id:
        metrics = await metric_service.get_metrics_for_datasource_id(
            datasource_id=datasource_id
        )
    else:
        metrics = await metric_service.get_metrics_for_user_id(user_id=user_id)

    metrics = [MetricWithUser.from_orm(m) for m in metrics]
    for metric in metrics:
        apperture_user = await user_service.get_user(id=str(metric.user_id))
        metric.user = AppertureUserResponse.from_orm(apperture_user)
    return metrics


@router.get(
    "/metrics/{id}",
    response_model=SavedMetricResponse,
    dependencies=[Depends(validate_library_items)],
)
async def get_metric_by_id(
    id: str,
    metric_service: MetricService = Depends(),
):
    return await metric_service.get_metric_by_id(metric_id=id)


@router.post("/metrics/validate_formula")
async def validate_metric_formula(
    dto: MetricFormulaDto,
    metric_service: MetricService = Depends(),
):
    return metric_service.validate_formula(
        formula=dto.formula, variable_list=dto.variableList
    )


@router.delete("/metrics/{metric_id}", dependencies=[Depends(validate_app_user)])
async def delete_metrics(
    metric_id: str,
    datasource_id: str,
    metric_service: MetricService = Depends(),
    notification_service: NotificationService = Depends(),
):
    await metric_service.delete_metric(metric_id=metric_id)

    await notification_service.fetch_and_delete_notification(
        reference_id=metric_id, datasource_id=datasource_id
    )
