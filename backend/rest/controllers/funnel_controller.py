from fastapi import APIRouter, Depends
from typing import List

from domain.funnels.service import FunnelsService
from domain.datasources.service import DataSourceService
from rest.dtos.funnels import FunnelResponse, ComputedFunnelStepResponse
from rest.dtos.funnels import CreateFunnelDto, TransientFunnelDto
from rest.middlewares import validate_jwt, get_user_id


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
):
    funnel = funnel_service.build_funnel(
        dto.datasourceId,
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
    datasource_service: DataSourceService = Depends(),
):
    datasource = await datasource_service.get_datasource(id=dto.datasourceId)
    return await funnel_service.compute_funnel(
        ds_id=dto.datasourceId, provider=datasource.provider, steps=dto.steps
    )
