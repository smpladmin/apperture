from typing import List

from fastapi import APIRouter, Depends

from domain.actions.service import ActionService
from domain.apperture_users.models import AppertureUser
from domain.datasources.service import DataSourceService
from rest.dtos.actions import CreateActionDto, ActionResponse, ActionWithUser
from rest.dtos.appperture_users import AppertureUserResponse
from rest.middlewares import validate_jwt, get_user_id, get_user

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
        datasource.id,
        datasource.app_id,
        user_id,
        dto.name,
        dto.groups,
    )

    await action_service.add_action(action)
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
