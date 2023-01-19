from fastapi import APIRouter, Depends
from typing import List

from domain.funnels.service import FunnelsService
from domain.apps.service import AppService
from domain.apperture_users.models import AppertureUser
from domain.datasources.service import DataSourceService
from rest.dtos.funnels import (
    FunnelResponse,
    ComputedFunnelStepResponse,
    ComputedFunnelResponse,
    FunnelWithUser,
    FunnelConversionResponseBody,
)
from rest.dtos.funnels import CreateFunnelDto, TransientFunnelDto, FunnelTrendResponse
from rest.dtos.appperture_users import AppertureUserResponse
from rest.middlewares import validate_jwt, get_user_id, get_user


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
    )

    await funnel_service.add_funnel(funnel)
    return funnel


@router.post("/funnels/transient", response_model=List[ComputedFunnelStepResponse])
async def compute_transient_funnel(
    dto: TransientFunnelDto,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.compute_funnel(ds_id=dto.datasourceId, steps=dto.steps)


@router.get("/funnels/{id}", response_model=FunnelResponse)
async def get_computed_funnel(
    id: str,
    funnel_service: FunnelsService = Depends(),
):
    funnel = await funnel_service.get_funnel(id)
    return funnel


@router.put("/funnels/{id}", response_model=FunnelResponse)
async def update_funnel(
    id: str,
    dto: CreateFunnelDto,
    user_id: str = Depends(get_user_id),
    funnel_service: FunnelsService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    new_funnel = funnel_service.build_funnel(
        datasource.id,
        datasource.app_id,
        user_id,
        dto.name,
        dto.steps,
        dto.randomSequence,
    )
    await funnel_service.update_funnel(funnel_id=id, new_funnel=new_funnel)
    return new_funnel


@router.get("/funnels/{id}/trends", response_model=List[FunnelTrendResponse])
async def get_funnel_trends(
    id: str,
    funnel_service: FunnelsService = Depends(),
):
    funnel = await funnel_service.get_funnel(id)
    return await funnel_service.get_funnel_trends(
        datasource_id=str(funnel.datasource_id), steps=funnel.steps
    )


@router.post("/funnels/trends/transient", response_model=List[FunnelTrendResponse])
async def get_transient_funnel_trends(
    dto: TransientFunnelDto,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.get_funnel_trends(
        datasource_id=dto.datasourceId, steps=dto.steps
    )


@router.post(
    "/funnels/analytics/transient", response_model=FunnelConversionResponseBody
)
async def get_transient_funnel_analytics(
    dto: TransientFunnelDto,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.get_user_conversion(
        datasource_id=dto.datasourceId, steps=dto.steps
    )


@router.get("/funnels", response_model=List[FunnelWithUser])
async def get_funnels(
    user: AppertureUser = Depends(get_user),
    funnel_service: FunnelsService = Depends(),
    app_service: AppService = Depends(),
):
    apps = await app_service.get_apps(user=user)
    funnels = await funnel_service.get_funnels_for_apps(
        app_ids=[app.id for app in apps]
    )
    funnels = [FunnelWithUser.from_orm(f) for f in funnels]
    for funnel in funnels:
        funnel.user = AppertureUserResponse.from_orm(user)
    return funnels
