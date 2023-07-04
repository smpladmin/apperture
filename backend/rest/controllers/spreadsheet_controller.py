from typing import List, Union

from clickhouse_connect.driver.exceptions import DatabaseError
from fastapi import APIRouter, Depends, HTTPException

from ai.text_to_sql import text_to_sql
from domain.apperture_users.models import AppertureUser
from domain.apperture_users.service import AppertureUserService
from domain.apps.service import AppService
from domain.datasources.service import DataSourceService
from domain.spreadsheets.service import SpreadsheetService
from repositories.clickhouse.parser.query_parser import BusinessError
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.spreadsheets import (
    ComputedSpreadsheetQueryResponse,
    CreateWorkBookDto,
    SavedWorkBookResponse,
    TransientSpreadsheetColumnDto,
    TransientSpreadsheetsDto,
    WorkBookResponse,
    WorkbookWithUser,
)
from rest.middlewares import get_user, validate_jwt
from rest.middlewares.get_user import get_user_id

router = APIRouter(
    tags=["workbooks"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/workbooks", response_model=WorkBookResponse)
async def create_workbook(
    dto: CreateWorkBookDto,
    user_id: str = Depends(get_user_id),
    ds_service: DataSourceService = Depends(),
    spreadsheets_service: SpreadsheetService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    workbook = spreadsheets_service.build_workbook(
        name=dto.name,
        datasource_id=datasource.id,
        spreadsheets=dto.spreadsheets,
        user_id=user_id,
        app_id=datasource.app_id,
    )

    await spreadsheets_service.add_workbook(workbook)
    return workbook


@router.get("/workbooks", response_model=List[WorkbookWithUser])
async def get_workbooks(
    datasource_id: Union[str, None] = None,
    app_id: Union[str, None] = None,
    user: AppertureUser = Depends(get_user),
    spreadsheets_service: SpreadsheetService = Depends(),
    user_service: AppertureUserService = Depends(),
):
    workbooks = []

    if app_id:
        workbooks = await spreadsheets_service.get_workbooks_for_app(app_id=app_id)
    elif datasource_id:
        workbooks = await spreadsheets_service.get_workbooks_for_datasource_id(
            datasource_id=datasource_id
        )
    else:
        workbooks = await spreadsheets_service.get_workbooks_for_user_id(
            user_id=user.id
        )

    workbooks = [WorkbookWithUser.from_orm(f) for f in workbooks]
    for workbook in workbooks:
        apperture_user = await user_service.get_user(id=str(workbook.user_id))
        workbook.user = AppertureUserResponse.from_orm(apperture_user)
    return workbooks


@router.post(
    "/workbooks/spreadsheets/transient", response_model=ComputedSpreadsheetQueryResponse
)
async def compute_transient_spreadsheets(
    dto: TransientSpreadsheetsDto, compute_query_action: ComputeQueryAction = Depends()
):
    return await compute_query_action.compute_query(dto=dto)


@router.post(
    "/workbooks/spreadsheets/columns/transient",
    response_model=ComputedSpreadsheetQueryResponse,
)
async def compute_transient_column(
    dto: TransientSpreadsheetColumnDto,
    spreadsheets_service: SpreadsheetService = Depends(),
    compute_query_action: ComputeQueryAction = Depends(),
):
    try:
        clickhouse_credential = compute_query_action.get_credentials(
            datasourceId=dto.datasourceId
        )

        return spreadsheets_service.get_transient_columns(
            dto.datasourceId,
            dto.dimensions,
            dto.metrics,
            dto.database,
            dto.table,
            clickhouse_credential,
        )
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")
    except DatabaseError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")


@router.get("/workbooks/{id}", response_model=SavedWorkBookResponse)
async def get_workbook_by_id(
    id: str,
    spreadsheets_service: SpreadsheetService = Depends(),
):
    return await spreadsheets_service.get_workbook_by_id(workbook_id=id)


@router.put("/workbooks/{id}", response_model=SavedWorkBookResponse)
async def update_workbook(
    id: str,
    dto: CreateWorkBookDto,
    user_id: str = Depends(get_user_id),
    ds_service: DataSourceService = Depends(),
    spreadsheets_service: SpreadsheetService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    workbook = spreadsheets_service.build_workbook(
        name=dto.name,
        datasource_id=datasource.id,
        spreadsheets=dto.spreadsheets,
        user_id=user_id,
        app_id=datasource.app_id,
    )

    await spreadsheets_service.update_workbook(workbook=workbook, workbook_id=id)
    return workbook


@router.delete("/workbooks/{workbook_id}")
async def delete_segments(
    workbook_id: str,
    spreadsheets_service: SpreadsheetService = Depends(),
):
    await spreadsheets_service.delete_workbook(workbook_id=workbook_id)
