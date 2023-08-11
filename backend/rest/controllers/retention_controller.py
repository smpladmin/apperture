from typing import List, Union

from fastapi import APIRouter, Depends

from domain.apperture_users.models import AppertureUser
from domain.apperture_users.service import AppertureUserService
from domain.apps.service import AppService
from domain.datasources.service import DataSourceService
from domain.retention.service import RetentionService
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.retention import (
    TransientRetentionDto,
    RetentionResponse,
    CreateRetentionDto,
    RetentionWithUser,
    ComputedRetentionResponse,
)

from rest.middlewares import validate_jwt, get_user_id, get_user
from rest.middlewares.validate_app_user import (
    validate_app_user,
    validate_library_items,
)

router = APIRouter(
    tags=["retention"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post(
    "/retention/transient",
    response_model=List[ComputedRetentionResponse],
    dependencies=[Depends(validate_app_user)],
)
async def compute_transient_retention(
    dto: TransientRetentionDto,
    retention_service: RetentionService = Depends(),
):
    return await retention_service.compute_retention(
        datasource_id=str(dto.datasourceId),
        start_event=dto.startEvent,
        goal_event=dto.goalEvent,
        granularity=dto.granularity,
        segment_filter=dto.segmentFilter,
        date_filter=dto.dateFilter,
    )


@router.post(
    "/retention",
    response_model=RetentionResponse,
    dependencies=[Depends(validate_app_user)],
)
async def create_retention(
    dto: CreateRetentionDto,
    user_id: str = Depends(get_user_id),
    retention_service: RetentionService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(str(dto.datasourceId))
    retention = retention_service.build_retention(
        datasource_id=datasource.id,
        app_id=datasource.app_id,
        user_id=user_id,
        name=dto.name,
        start_event=dto.startEvent,
        goal_event=dto.goalEvent,
        granularity=dto.granularity,
        date_filter=dto.dateFilter,
        segment_filter=dto.segmentFilter,
    )

    await retention_service.add_retention(retention)
    return retention


@router.get(
    "/retention/{id}",
    response_model=RetentionResponse,
    dependencies=[Depends(validate_library_items)],
)
async def get_retention(
    id: str,
    retention_service: RetentionService = Depends(),
):
    return await retention_service.get_retention(id)


@router.put(
    "/retention/{id}",
    response_model=RetentionResponse,
    dependencies=[Depends(validate_app_user)],
)
async def update_retention(
    id: str,
    dto: CreateRetentionDto,
    user_id: str = Depends(get_user_id),
    retention_service: RetentionService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(str(dto.datasourceId))
    new_retention = retention_service.build_retention(
        datasource_id=datasource.id,
        app_id=datasource.app_id,
        user_id=user_id,
        name=dto.name,
        start_event=dto.startEvent,
        goal_event=dto.goalEvent,
        granularity=dto.granularity,
        date_filter=dto.dateFilter,
        segment_filter=dto.segmentFilter,
    )
    await retention_service.update_retention(
        retention_id=id, new_retention=new_retention
    )
    return new_retention


@router.get(
    "/retention",
    response_model=List[RetentionWithUser],
    dependencies=[Depends(validate_app_user)],
)
async def get_retention_list(
    datasource_id: Union[str, None] = None,
    app_id: Union[str, None] = None,
    user: AppertureUser = Depends(get_user),
    retention_service: RetentionService = Depends(),
    app_service: AppService = Depends(),
    user_service: AppertureUserService = Depends(),
):
    if app_id:
        apps = await app_service.get_apps(user=user)
        retentions = await retention_service.get_retentions_for_apps(
            app_ids=[app.id for app in apps]
        )
    elif datasource_id:
        retentions = await retention_service.get_retentions_for_datasource_id(
            datasource_id=datasource_id
        )
    else:
        retentions = await retention_service.get_retentions_for_user_id(user_id=user.id)

    retentions = [RetentionWithUser.from_orm(f) for f in retentions]
    for retention in retentions:
        apperture_user = await user_service.get_user(id=str(retention.user_id))
        retention.user = AppertureUserResponse.from_orm(apperture_user)
    return retentions


@router.delete(
    "/retention/{retention_id}",
    dependencies=[Depends(validate_library_items)],
)
async def delete_retention(
    retention_id: str,
    retention_service: RetentionService = Depends(),
):
    await retention_service.delete_retention(retention_id=retention_id)
