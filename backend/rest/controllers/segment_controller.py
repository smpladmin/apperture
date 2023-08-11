from typing import List, Optional, Union
from fastapi import APIRouter, Depends
from domain.apperture_users.service import AppertureUserService

from domain.datasources.service import DataSourceService
from domain.segments.service import SegmentService
from domain.apperture_users.models import AppertureUser
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.segments import (
    SegmentWithUser,
    TransientSegmentDto,
    ComputedSegmentResponse,
    CreateSegmentDto,
    SegmentResponse,
)

from rest.middlewares import validate_jwt, get_user, get_user_id
from rest.middlewares.validate_app_user import (
    validate_app_user_middleware,
    validate_library_items_middleware,
)

router = APIRouter(
    tags=["segments"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post(
    "/segments/transient",
    response_model=ComputedSegmentResponse,
    dependencies=[Depends(validate_app_user_middleware)],
)
async def compute_transient_segment(
    dto: TransientSegmentDto,
    segment_service: SegmentService = Depends(),
):
    return await segment_service.compute_segment(
        datasource_id=str(dto.datasourceId),
        groups=dto.groups,
        columns=dto.columns,
    )


@router.post(
    "/segments",
    response_model=SegmentResponse,
    dependencies=[Depends(validate_app_user_middleware)],
)
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


@router.put(
    "/segments/{id}",
    response_model=SegmentResponse,
    dependencies=[Depends(validate_app_user_middleware)],
)
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


@router.get(
    "/segments/{segment_id}",
    response_model=SegmentResponse,
    dependencies=[Depends(validate_library_items_middleware)],
)
async def get_segment(
    segment_id: str,
    segment_service: SegmentService = Depends(),
):
    return await segment_service.get_segment(segment_id=segment_id)


@router.get(
    "/segments",
    response_model=List[SegmentWithUser],
    dependencies=[Depends(validate_app_user_middleware)],
)
async def get_segments(
    datasource_id: Union[str, None] = None,
    app_id: Optional[str] = None,
    user_id: str = Depends(get_user_id),
    segment_service: SegmentService = Depends(),
    user_service: AppertureUserService = Depends(),
):
    if app_id:
        segments = await segment_service.get_segments_for_app(app_id=app_id)
    elif datasource_id:
        segments = await segment_service.get_segments_for_datasource_id(
            datasource_id=datasource_id
        )
    else:
        segments = await segment_service.get_segments_for_user(user_id=user_id)

    segments = [SegmentWithUser.from_orm(s) for s in segments]
    for segment in segments:
        apperture_user = await user_service.get_user(id=str(segment.user_id))
        segment.user = AppertureUserResponse.from_orm(apperture_user)
    return segments


@router.delete(
    "/segments/{segment_id}", dependencies=[Depends(validate_library_items_middleware)]
)
async def delete_segments(
    segment_id: str,
    segment_service: SegmentService = Depends(),
):
    await segment_service.delete_segment(segment_id=segment_id)
