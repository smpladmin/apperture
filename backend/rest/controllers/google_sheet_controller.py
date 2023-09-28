from fastapi import APIRouter, Depends, HTTPException, Header
from domain.apperture_users.service import AppertureUserService
from domain.apps.service import AppService
from domain.spreadsheets.models import DatabaseClient

from rest.controllers.actions.app_connections import AppConnections
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.google_sheet import TransientGoogleSheetsDto
from rest.dtos.spreadsheets import (
    ComputedSpreadsheetQueryResponse,
)
from rest.middlewares import validate_api_key_and_user
from clickhouse_connect.driver.exceptions import DatabaseError


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
    return await app_connections.get_app_connections(
        app=app, allow_sql_connections=False
    )


@router.post(
    "/transient",
    response_model=ComputedSpreadsheetQueryResponse,
)
async def compute_transient_spreadsheets(
    dto: TransientGoogleSheetsDto,
    api_key: str = Header(None),
    compute_query_action: ComputeQueryAction = Depends(),
    user_service: AppertureUserService = Depends(),
    app_service: AppService = Depends(),
):
    user = await user_service.get_user_by_api_key(api_key=api_key)
    app = await app_service.get_app_for_user(user_id=str(user.id))
    clickhouse_credentials = app.clickhouse_credential

    try:
        return await compute_query_action.get_transient_spreadsheets(
            query=dto.query,
            credential=clickhouse_credentials,
            client=DatabaseClient.CLICKHOUSE,
            serializeResult=True,
        )
    except DatabaseError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")
