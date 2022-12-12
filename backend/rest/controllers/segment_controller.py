from fastapi import APIRouter, Depends

from domain.datasources.service import DataSourceService
from domain.segments.service import SegmentService
from domain.users.models import User
from rest.dtos.segments import (
    TransientSegmentDto,
    ComputedSegmentResponse,
    CreateSegmentDto,
)

from rest.middlewares import validate_jwt, get_user

router = APIRouter(
    tags=["segments"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/segments/transient", response_model=ComputedSegmentResponse)
async def compute_transient_segment(
    dto: TransientSegmentDto,
    segment_service: SegmentService = Depends(),
):
    return await segment_service.compute_segment(
        datasource_id=str(dto.datasourceId),
        groups=dto.groups,
        columns=dto.columns,
        group_conditions=dto.groupConditions,
    )


@router.post("/segments")
async def save_segment(
    dto: CreateSegmentDto,
    user: User = Depends(get_user),
    segment_service: SegmentService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(str(dto.datasourceId))
    segment = await segment_service.build_segment(
        datasourceId=dto.datasourceId,
        appId=datasource.app_id,
        userId=user.id,
        name=dto.name,
        description=dto.description,
        groups=dto.groups,
        groupConditions=dto.groupConditions,
        columns=dto.columns,
    )
    await segment_service.add_segment(segment=segment)
    return segment
