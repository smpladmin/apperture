import logging
from typing import List, Union

from fastapi import APIRouter, Depends, HTTPException
from fastapi import APIRouter, Depends
from domain.apps.service import AppService
from domain.spreadsheets.models import DatabaseClient
from rest.controllers.actions.compute_query import ComputeQueryAction
from domain.apperture_users.service import AppertureUserService
from domain.datamart.service import DataMartService
from domain.datamart_actions.models import DatamartActions
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


@router.get(
    "/datamart_actions/google/spreadsheets",
    response_model=List,
)
async def get_spreadsheets(
    user_id: str = Depends(get_user_id),
    user_service: AppertureUserService = Depends(),
    datamart_action_service: DatamartActionService = Depends(),
):
    user = await user_service.get_user(id=user_id)
    return datamart_action_service.get_google_spreadsheets(
        refresh_token=user.sheet_token
    )


@router.get(
    "/datamart_actions/google/sheets/{spreadsheet_id}",
    response_model=List,
)
async def get_spreadsheets(
    spreadsheet_id: str,
    user_id: str = Depends(get_user_id),
    user_service: AppertureUserService = Depends(),
    datamart_action_service: DatamartActionService = Depends(),
):
    user = await user_service.get_user(id=user_id)
    return datamart_action_service.get_sheet_names(
        refresh_token=user.sheet_token, spreadsheet_id=spreadsheet_id
    )


@router.get(
    "/datamart_actions/{id}",
    response_model=DatamartActionsResponse,
)
async def get_saved_datamart_action(
    id: str,
    datamart_action_service: DatamartActionService = Depends(),
):
    return await datamart_action_service.get_datamart_action(id=id)


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
    response_model=DatamartActionsResponse,
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
    updated_datamart_action = DatamartActions(**datamart_action.dict(), _id=id)
    return updated_datamart_action


@router.delete(
    "/datamart_actions/{id}",
)
async def delete_datamart_action(
    id: str,
    datamart_action_service: DatamartActionService = Depends(),
):
    await datamart_action_service.delete_datamart_actions(id=id)
