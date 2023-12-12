from typing import List, Optional, Union

from fastapi import APIRouter, Depends
from fastapi import APIRouter, Depends
from domain.datamart.service import DataMartService
from domain.datamart_actions.service import DatamartActionService
from rest.dtos.datamart_actions import DatamartActionsDto, DatamartActionsResponse

from rest.middlewares import get_user_id, validate_jwt
from rest.middlewares.validate_app_user import validate_library_items


router = APIRouter(
    tags=["datamart_actions"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get(
    "/datamart_actions/{id}",
    response_model=DatamartActionsResponse,
    dependencies=[Depends(validate_library_items)],
)
async def get_saved_datamart_action(
    id: str,
    datamart_action_service: DatamartActionService = Depends(),
):
    return await datamart_action_service.get_datamart_action(id=id)


@router.get(
    "/datamart_actions",
    response_model=List[DatamartActionsResponse],
)
async def get_saved_datamart_actions(
    datamart_id: Union[str, None] = None,
    datamart_action_service: DatamartActionService = Depends(),
):
    if datamart_id:
        return await datamart_action_service.get_datamart_actions_for_datamart(
            datamart_id=datamart_id
        )
    return await datamart_action_service.get_datamart_actions()


@router.post(
    "/datamart_actions",
    response_model=DatamartActionsResponse,
)
async def save_datamart_action(
    dto: DatamartActionsDto,
    datamart_service: DataMartService = Depends(),
    datamart_action_service: DatamartActionService = Depends(),
    user_id: str = Depends(get_user_id),
):
    datamart = await datamart_service.get_datamart_table(id=dto.datamartId)
    datamart_action = datamart_action_service.build_datamart_action(
        datasource_id=datamart.datasource_id,
        datamart_id=datamart.id,
        app_id=datamart.app_id,
        user_id=user_id,
        schedule=dto.schedule,
        type=dto.type,
        meta=dto.meta,
    )
    return await datamart_action_service.save_datamart_action(
        datamart_action=datamart_action
    )


@router.put(
    "/datamart_actions/{id}",
)
async def update_datamart_action(
    id: str,
    dto: DatamartActionsDto,
    datamart_service: DataMartService = Depends(),
    datamart_action_service: DatamartActionService = Depends(),
    user_id: str = Depends(get_user_id),
):
    datamart = await datamart_service.get_datamart_table(id=dto.datamartId)
    datamart_action = datamart_action_service.build_datamart_action(
        datasource_id=datamart.datasource_id,
        datamart_id=datamart.id,
        app_id=datamart.app_id,
        user_id=user_id,
        schedule=dto.schedule,
        type=dto.type,
        meta=dto.meta,
    )
    await datamart_action_service.update_datamart_action(id=id, action=datamart_action)
    return datamart_action
