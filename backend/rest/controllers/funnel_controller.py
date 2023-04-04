from typing import List, Union

from fastapi import APIRouter, Depends

from domain.apperture_users.models import AppertureUser
from domain.apps.service import AppService
from domain.datasources.service import DataSourceService
from domain.funnels.service import FunnelsService
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.funnels import (
    CreateFunnelDto,
    TransientFunnelDto,
    FunnelTrendResponse,
    TransientFunnelConversionlDto,
)
from rest.dtos.funnels import (
    FunnelResponse,
    ComputedFunnelStepResponse,
    FunnelWithUser,
    FunnelConversionResponseBody,
)
from rest.middlewares import validate_jwt, get_user_id, get_user
from tests.rest.controllers.conftest import notification_service
from domain.notifications.service import NotificationService

router = APIRouter(
    tags=["funnels"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/funnels", response_model=FunnelResponse)
async def create_funnel(
    dto: CreateFunnelDto,
    user_id: str = Depends(get_user_id),
    funnel_service: FunnelsService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    funnel = funnel_service.build_funnel(
        datasource.id,
        datasource.app_id,
        user_id,
        dto.name,
        dto.steps,
        dto.randomSequence,
        dto.dateFilter,
        dto.conversionWindow,
    )

    await funnel_service.add_funnel(funnel)
    return funnel


@router.post("/funnels/transient", response_model=List[ComputedFunnelStepResponse])
async def compute_transient_funnel(
    dto: TransientFunnelDto,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.compute_funnel(
        ds_id=dto.datasourceId,
        steps=dto.steps,
        date_filter=dto.dateFilter,
        conversion_window=dto.conversionWindow,
    )


@router.get("/funnels/{id}", response_model=FunnelResponse)
async def get_saved_funnel(
    id: str,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.get_funnel(id)


@router.put("/funnels/{id}", response_model=FunnelResponse)
async def update_funnel(
    id: str,
    dto: CreateFunnelDto,
    user_id: str = Depends(get_user_id),
    funnel_service: FunnelsService = Depends(),
    ds_service: DataSourceService = Depends(),
    notification_service: NotificationService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    new_funnel = funnel_service.build_funnel(
        datasource.id,
        datasource.app_id,
        user_id,
        dto.name,
        dto.steps,
        dto.randomSequence,
        dto.dateFilter,
        dto.conversionWindow,
    )
    await funnel_service.update_funnel(funnel_id=id, new_funnel=new_funnel)

    await notification_service.fetch_and_delete_notification(
        reference_id=id, datasource_id=str(datasource.id)
    )

    return new_funnel


@router.get("/funnels/{id}/trends", response_model=List[FunnelTrendResponse])
async def get_funnel_trends(
    id: str,
    funnel_service: FunnelsService = Depends(),
):
    funnel = await funnel_service.get_funnel(id)
    return await funnel_service.get_funnel_trends(
        datasource_id=str(funnel.datasource_id),
        steps=funnel.steps,
        date_filter=funnel.date_filter,
        conversion_window=funnel.conversion_window,
    )


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


@router.post(
    "/funnels/analytics/transient", response_model=FunnelConversionResponseBody
)
async def get_transient_funnel_analytics(
    dto: TransientFunnelConversionlDto,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.get_user_conversion(
        datasource_id=dto.datasourceId,
        steps=dto.steps,
        status=dto.status,
        date_filter=dto.dateFilter,
        conversion_window=dto.conversionWindow,
    )


@router.get("/funnels", response_model=List[FunnelWithUser])
async def get_funnels(
    datasource_id: Union[str, None] = None,
    user: AppertureUser = Depends(get_user),
    funnel_service: FunnelsService = Depends(),
    app_service: AppService = Depends(),
):
    apps = await app_service.get_apps(user=user)
    funnels = (
        await funnel_service.get_funnels_for_datasource_id(datasource_id=datasource_id)
        if datasource_id
        else await funnel_service.get_funnels_for_apps(app_ids=[app.id for app in apps])
    )
    funnels = [FunnelWithUser.from_orm(f) for f in funnels]
    for funnel in funnels:
        funnel.user = AppertureUserResponse.from_orm(user)
    return funnels


@router.delete("/funnels/{funnel_id}")
async def delete_funnel(
    funnel_id: str,
    datasource_id: str,
    funnel_service: FunnelsService = Depends(),
    notification_service: NotificationService = Depends(),
):
    await funnel_service.delete_funnel(funnel_id=funnel_id)

    await notification_service.fetch_and_delete_notification(
        reference_id=funnel_id, datasource_id=datasource_id
    )
