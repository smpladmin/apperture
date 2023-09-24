from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
from domain.apperture_users.service import AppertureUserService
from domain.apps.service import AppService

from rest.controllers.actions.app_connections import AppConnections
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.spreadsheets import (
    ComputedSpreadsheetQueryResponse,
    TransientSpreadsheetsDto,
)
from rest.middlewares import validate_api_key_and_user, validate_app_user


router = APIRouter(
    tags=["google-sheets"],
    dependencies=[Depends(validate_api_key_and_user)],
    responses={401: {}},
    prefix="/apperture/google-sheets",
)


@router.get("/connections")
async def get_connections(
    api_key: str = Header(None),
    user_service: AppertureUserService = Depends(),
    app_service: AppService = Depends(),
    app_connections: AppConnections = Depends(),
):
    user = await user_service.get_user_by_api_key(api_key=api_key)

    app = await app_service.get_app_for_user(user_id=str(user.id))
    return await app_connections.get_app_connections(app=app)


@router.post(
    "/transient",
    response_model=ComputedSpreadsheetQueryResponse,
)
async def compute_transient_spreadsheets(
    dto: TransientSpreadsheetsDto, compute_query_action: ComputeQueryAction = Depends()
):

    return await compute_query_action.compute_query(dto=dto)
