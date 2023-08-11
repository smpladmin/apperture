from typing import List, Union

from fastapi import APIRouter, Depends, HTTPException

from domain.apperture_users.models import AppertureUser
from domain.apperture_users.service import AppertureUserService
from domain.apps.service import AppService
from domain.datasources.service import DataSourceService
from domain.funnels.service import FunnelsService
from domain.notifications.service import NotificationService
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.funnels import (
    ComputedFunnelStepResponse,
    CreateFunnelDto,
    FunnelConversionResponseBody,
    FunnelResponse,
    FunnelTrendResponse,
    FunnelWithUser,
    TransientFunnelConversionlDto,
    TransientFunnelDto,
)
from rest.middlewares import get_user, get_user_id, validate_jwt
from rest.middlewares.validate_app_user import (
    validate_app_user,
    validate_library_items,
)

router = APIRouter(
    tags=["funnels"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post(
    "/funnels",
    response_model=FunnelResponse,
    dependencies=[Depends(validate_app_user)],
)
async def create_funnel(
    dto: CreateFunnelDto,
    user: AppertureUser = Depends(get_user),
    funnel_service: FunnelsService = Depends(),
    app_service: AppService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    if app_service.is_valid_user_for_app(app_id=datasource.app_id, user=user):
        funnel = funnel_service.build_funnel(
            datasource.id,
            datasource.app_id,
            str(user.id),
            dto.name,
            dto.steps,
            dto.randomSequence,
            dto.dateFilter,
            dto.conversionWindow,
            dto.segmentFilter,
        )

        await funnel_service.add_funnel(funnel)
        return funnel
    else:
        raise HTTPException(status_code=403, detail="Access forbidden")


@router.post(
    "/funnels/transient",
    response_model=List[ComputedFunnelStepResponse],
    dependencies=[Depends(validate_app_user)],
)
async def compute_transient_funnel(
    dto: TransientFunnelDto,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.compute_funnel(
        ds_id=dto.datasourceId,
        steps=dto.steps,
        date_filter=dto.dateFilter,
        conversion_window=dto.conversionWindow,
        random_sequence=dto.randomSequence,
        segment_filter=dto.segmentFilter,
    )


@router.get(
    "/funnels/{id}",
    response_model=FunnelResponse,
    dependencies=[Depends(validate_library_items)],
)
async def get_saved_funnel(
    id: str,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.get_funnel(id)


@router.put(
    "/funnels/{id}",
    response_model=FunnelResponse,
    dependencies=[Depends(validate_app_user)],
)
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
        dto.segmentFilter,
    )
    await funnel_service.update_funnel(funnel_id=id, new_funnel=new_funnel)

    await notification_service.fetch_and_delete_notification(
        reference_id=id, datasource_id=str(datasource.id)
    )

    return new_funnel


@router.get(
    "/funnels/{id}/trends",
    response_model=List[FunnelTrendResponse],
    dependencies=[Depends(validate_library_items)],
)
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
        random_sequence=funnel.random_sequence,
        segment_filter=funnel.segment_filter,
    )


@router.post(
    "/funnels/trends/transient",
    response_model=List[FunnelTrendResponse],
    dependencies=[Depends(validate_app_user)],
)
async def get_transient_funnel_trends(
    dto: TransientFunnelDto,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.get_funnel_trends(
        datasource_id=dto.datasourceId,
        steps=dto.steps,
        date_filter=dto.dateFilter,
        conversion_window=dto.conversionWindow,
        random_sequence=dto.randomSequence,
        segment_filter=dto.segmentFilter,
    )


@router.post(
    "/funnels/analytics/transient",
    response_model=FunnelConversionResponseBody,
    dependencies=[Depends(validate_app_user)],
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
        random_sequence=dto.randomSequence,
        segment_filter=dto.segmentFilter,
    )


@router.get(
    "/funnels",
    response_model=List[FunnelWithUser],
    dependencies=[Depends(validate_app_user)],
)
async def get_funnels(
    datasource_id: Union[str, None] = None,
    app_id: Union[str, None] = None,
    user: AppertureUser = Depends(get_user),
    funnel_service: FunnelsService = Depends(),
    app_service: AppService = Depends(),
    user_service: AppertureUserService = Depends(),
):
    if app_id:
        apps = await app_service.get_apps(user=user)
        funnels = await funnel_service.get_funnels_for_apps(
            app_ids=[app.id for app in apps]
        )
    elif datasource_id:
        funnels = await funnel_service.get_funnels_for_datasource_id(
            datasource_id=datasource_id
        )
    else:
        funnels = await funnel_service.get_funnels_for_user_id(user_id=user.id)

    funnels = [FunnelWithUser.from_orm(f) for f in funnels]
    for funnel in funnels:
        apperture_user = await user_service.get_user(id=str(funnel.user_id))
        funnel.user = AppertureUserResponse.from_orm(apperture_user)
    return funnels


@router.delete(
    "/funnels/{funnel_id}", dependencies=[Depends(validate_app_user)]
)
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
