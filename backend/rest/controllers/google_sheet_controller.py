from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header
from domain.apperture_users.service import AppertureUserService
from domain.apps.service import AppService
from domain.google_sheet.models import SheetQuery
from domain.google_sheet.service import GoogleSheetService
from domain.spreadsheets.models import AIQuery, DatabaseClient, WorkBook
from domain.spreadsheets.service import SpreadsheetService

from rest.controllers.actions.app_connections import AppConnectionsAction
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.google_sheet import (
    ComputedTransientSpreadsheetResponse,
    CreateSheetQueryDto,
    SheetQueryResponse,
    TransientGoogleSheetsDto,
)
from rest.dtos.spreadsheets import SavedWorkBookResponse

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


@router.get(
    "/workbooks",
    response_model=List[SavedWorkBookResponse],
)
async def get_workbooks(
    spreadsheets_service: SpreadsheetService = Depends(),
    api_key: str = Header(None),
    user_service: AppertureUserService = Depends(),
):
    user = await user_service.get_user_by_api_key(api_key=api_key)
    workbooks = await spreadsheets_service.get_workbooks_for_user_id(user_id=user.id)

    return workbooks


@router.get(
    "/sheet-query/{spreadsheet_id}",
    response_model=List[SheetQueryResponse],
)
async def get_sheet_query(
    spreadsheet_id: str,
    google_sheet_service: GoogleSheetService = Depends(),
):
    return await google_sheet_service.get_sheet_queries_by_spreadsheet_id(
        spreadsheet_id=spreadsheet_id
    )


@router.post(
    "/sheet-query",
    response_model=SheetQueryResponse,
)
async def create_sheet_query(
    dto: CreateSheetQueryDto,
    api_key: str = Header(None),
    user_service: AppertureUserService = Depends(),
    app_service: AppService = Depends(),
    google_sheet_service: GoogleSheetService = Depends(),
):
    user = await user_service.get_user_by_api_key(api_key=api_key)
    app = await app_service.get_app_for_user(user_id=str(user.id))

    sheet_query = google_sheet_service.build_sheet_query(
        name=dto.name,
        app_id=app.id,
        user_id=user.id,
        spreadsheet_id=dto.spreadsheetId,
        query=dto.query,
        chats=dto.chats,
        sheet_reference=dto.sheetReference,
    )

    await google_sheet_service.add_sheet_query(sheet_query=sheet_query)
    return sheet_query


@router.put(
    "/sheet-query/{id}",
    response_model=SheetQueryResponse,
)
async def update_sheet_query(
    id: str,
    dto: CreateSheetQueryDto,
    api_key: str = Header(None),
    user_service: AppertureUserService = Depends(),
    app_service: AppService = Depends(),
    google_sheet_service: GoogleSheetService = Depends(),
):
    user = await user_service.get_user_by_api_key(api_key=api_key)
    app = await app_service.get_app_for_user(user_id=str(user.id))

    sheet_query = google_sheet_service.build_sheet_query(
        name=dto.name,
        app_id=app.id,
        user_id=user.id,
        spreadsheet_id=dto.spreadsheetId,
        query=dto.query,
        chats=dto.chats,
        sheet_reference=dto.sheetReference,
    )

    await google_sheet_service.update_sheet_query(
        sheet_query_id=id, sheet_query=sheet_query
    )
    return sheet_query
