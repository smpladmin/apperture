from typing import List

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends

from domain.actions.service import ActionService
from domain.apperture_users.models import AppertureUser
from domain.datasources.service import DataSourceService
from rest.dtos.actions import (
    ActionResponse,
    ActionWithUser,
    ComputedActionResponse,
    CreateActionDto,
    TransientActionDto,
)
from rest.dtos.apperture_users import AppertureUserResponse
from rest.middlewares import get_user, get_user_id, validate_jwt

router = APIRouter(
    tags=["actions"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/actions", response_model=ActionResponse)
async def create_action(
    dto: CreateActionDto,
    user_id: str = Depends(get_user_id),
    action_service: ActionService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    action = action_service.build_action(
        datasourceId=datasource.id,
        appId=datasource.app_id,
        userId=user_id,
        name=dto.name,
        groups=dto.groups,
    )
    await action_service.add_action(action=action)
    await action_service.update_events_from_clickstream(datasource_id=dto.datasourceId)
    return action


@router.get("/actions", response_model=List[ActionWithUser])
async def get_actions(
    datasource_id: str,
    action_service: ActionService = Depends(),
    user: AppertureUser = Depends(get_user),
):
    actions = await action_service.get_actions_for_datasource_id(
        datasource_id=datasource_id
    )
    actions = [ActionWithUser.from_orm(s) for s in actions]
    for action in actions:
        action.user = AppertureUserResponse.from_orm(user)

    return actions


@router.get("/actions/{id}", response_model=ActionResponse)
async def get_saved_action(
    id: str,
    action_service: ActionService = Depends(),
):
    return await action_service.get_action(id=id)


@router.put("/actions/{id}", response_model=ActionResponse)
async def update_action(
    id: str,
    dto: CreateActionDto,
    user_id: str = Depends(get_user_id),
    action_service: ActionService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    action = action_service.build_action(
        datasourceId=datasource.id,
        appId=datasource.app_id,
        userId=user_id,
        name=dto.name,
        groups=dto.groups,
    )

    await action_service.update_action(action_id=id, action=action)
    return action


@router.post("/actions/transient", response_model=ComputedActionResponse)
async def compute_transient_actions(
    dto: TransientActionDto,
    action_service: ActionService = Depends(),
):
    return await action_service.compute_action(
        datasource_id=dto.datasourceId, groups=dto.groups
    )


@router.delete("/actions/{id}")
async def delete_action(
    id: PydanticObjectId, action_service: ActionService = Depends()
):
    await action_service.delete_action(id=id)
