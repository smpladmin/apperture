from typing import List, Union

from clickhouse_connect.driver.exceptions import DatabaseError
from fastapi import APIRouter, Depends, HTTPException

from ai.text_to_sql import text_to_sql
from domain.apperture_users.models import AppertureUser
from domain.apps.service import AppService
from domain.datasources.service import DataSourceService
from domain.event_properties.service import EventPropertiesService
from domain.spreadsheets.service import SpreadsheetService
from repositories.clickhouse.parser.query_parser import BusinessError
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.spreadsheets import (
    ComputedSpreadsheetQueryResponse,
    CreateWorkBookDto,
    SavedWorkBookResponse,
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
    user: AppertureUser = Depends(get_user),
    spreadsheets_service: SpreadsheetService = Depends(),
):
    workbooks = (
        await spreadsheets_service.get_workbooks_for_datasource_id(
            datasource_id=datasource_id
        )
        if datasource_id
        else await spreadsheets_service.get_workbooks_by_user_id(user_id=user.id)
    )
    workbooks = [WorkbookWithUser.from_orm(f) for f in workbooks]
    for workbook in workbooks:
        workbook.user = AppertureUserResponse.from_orm(user)
    return workbooks


@router.post(
    "/workbooks/spreadsheets/transient", response_model=ComputedSpreadsheetQueryResponse
)
async def compute_transient_spreadsheets(
    dto: TransientSpreadsheetsDto,
    spreadsheets_service: SpreadsheetService = Depends(),
    datasource_service: DataSourceService = Depends(),
    app_service: AppService = Depends(),
):
    try:
        datasource = await datasource_service.get_datasource(dto.datasourceId)
        app = await app_service.get_app(id=datasource.app_id)

        has_app_credential = bool(app.clickhouse_credential)

        clickhouse_credential = (
            app.clickhouse_credential
            if has_app_credential
            else await app_service.create_clickhouse_user(app.id)
        )

        if not has_app_credential:
            datasources = datasource_service.get_datasources_for_app_id(app.id)
            for ds in datasources:
                await datasource_service.create_user_policy(
                    username=clickhouse_credential.username,
                    datasource_id=ds.id,
                )

        if not dto.is_sql:
            sql_query = text_to_sql(dto.query)
            return await spreadsheets_service.get_transient_spreadsheets(
                query=sql_query,
                username=clickhouse_credential.username,
                password=clickhouse_credential.password,
            )
        return await spreadsheets_service.get_transient_spreadsheets(
            query=dto.query,
            username=clickhouse_credential.username,
            password=clickhouse_credential.password,
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
