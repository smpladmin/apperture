from fastapi import APIRouter, Depends, HTTPException, Header
from domain.apperture_users.service import AppertureUserService
from domain.apps.service import AppService
from domain.spreadsheets.models import AIQuery, DatabaseClient

from rest.controllers.actions.app_connections import AppConnectionsAction
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.google_sheet import (
    ComputedTransientSpreadsheetResponse,
    TransientGoogleSheetsDto,
)

from rest.middlewares import validate_api_key_and_user
from clickhouse_connect.driver.exceptions import DatabaseError
from ai.text_to_sql import text_to_sql


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
    app_connections_action: AppConnectionsAction = Depends(),
):
    user = await user_service.get_user_by_api_key(api_key=api_key)

    app = await app_service.get_app_for_user(user_id=str(user.id))
    return await app_connections_action.get_app_connections(
        app=app, allow_sql_connections=False
    )


@router.post(
    "/transient",
    response_model=ComputedTransientSpreadsheetResponse,
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
    query = dto.query

    if not dto.isSql and dto.tableData:
        table = dto.tableData.tableName
        word_replacements = dto.tableData.wordReplacements
        database = (
            "default" if table == "events" else clickhouse_credentials.databasename
        )
        ai_query = AIQuery(
            nl_query=query,
            word_replacements=word_replacements,
            database=database,
            table=table,
        )
        query = text_to_sql(query=ai_query)

    try:
        return await compute_query_action.get_transient_spreadsheets(
            query=query,
            credential=clickhouse_credentials,
            client=DatabaseClient.CLICKHOUSE,
        )
    except DatabaseError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")
