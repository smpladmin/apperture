from typing import List
from fastapi import APIRouter, Depends

from domain.datasources.service import DataSourceService
from domain.segments.service import SegmentService
from domain.apperture_users.models import AppertureUser
from rest.dtos.segments import (
    TransientSegmentDto,
    ComputedSegmentResponse,
    CreateSegmentDto,
    SegmentResponse,
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
    )


@router.post("/segments", response_model=SegmentResponse)
async def save_segment(
    dto: CreateSegmentDto,
    user: AppertureUser = Depends(get_user),
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
        columns=dto.columns,
    )
    return await segment_service.add_segment(segment=segment)


@router.put("/segments/{id}", response_model=SegmentResponse)
async def update_segment(
    id: str,
    dto: CreateSegmentDto,
    user: AppertureUser = Depends(get_user),
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
        columns=dto.columns,
    )
    await segment_service.update_segment(segment_id=id, new_segment=segment)
    return segment


@router.get("/segments/{segment_id}", response_model=SegmentResponse)
async def get_segment(
    segment_id: str,
    segment_service: SegmentService = Depends(),
):
    return await segment_service.get_segment(segment_id=segment_id)


@router.get("/segments", response_model=List[SegmentResponse])
async def get_segments(
    app_id: str,
    segment_service: SegmentService = Depends(),
):
    return await segment_service.get_segments_for_app(app_id=app_id)
