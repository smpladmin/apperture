from typing import List, Union

from clickhouse_connect.driver.exceptions import DatabaseError
from fastapi import APIRouter, Depends, HTTPException

from domain.apperture_users.models import AppertureUser
from domain.apperture_users.service import AppertureUserService
from domain.datasources.service import DataSourceService
from domain.spreadsheets.service import SpreadsheetService
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.spreadsheets import (
    ComputedSpreadsheetQueryResponse,
    ComputePivotDto,
    CreateWorkBookDto,
    SavedWorkBookResponse,
    TransientExpressionDto,
    TransientSpreadsheetColumnDto,
    TransientSpreadsheetsDto,
    VlookupDto,
    WorkBookResponse,
    WorkbookWithUser,
)
from rest.middlewares import get_user, validate_jwt
from rest.middlewares.get_user import get_user_id
from rest.middlewares.validate_app_user import validate_app_user, validate_library_items
from utils.errors import BusinessError

router = APIRouter(
    tags=["workbooks"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post(
    "/workbooks",
    response_model=WorkBookResponse,
    dependencies=[Depends(validate_app_user)],
)
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


@router.get(
    "/workbooks",
    response_model=List[WorkbookWithUser],
    dependencies=[Depends(validate_app_user)],
)
async def get_workbooks(
    datasource_id: Union[str, None] = None,
    app_id: Union[str, None] = None,
    user: AppertureUser = Depends(get_user),
    spreadsheets_service: SpreadsheetService = Depends(),
    user_service: AppertureUserService = Depends(),
):
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
    "/workbooks/spreadsheets/transient",
    response_model=ComputedSpreadsheetQueryResponse,
    dependencies=[Depends(validate_app_user)],
)
async def compute_transient_spreadsheets(
    dto: TransientSpreadsheetsDto, compute_query_action: ComputeQueryAction = Depends()
):
    return await compute_query_action.compute_query(dto=dto)


@router.post(
    "/workbooks/spreadsheets/expression/transient",
)
async def compute_transient_expression(
    dto: TransientExpressionDto,
    spreadsheets_service: SpreadsheetService = Depends(),
    compute_query_action: ComputeQueryAction = Depends(),
):
    try:
        clickhouse_credential = await compute_query_action.get_clickhouse_credentials(
            datasource_id=dto.datasourceId
        )
        return spreadsheets_service.compute_transient_expression(
            username=clickhouse_credential.username,
            password=clickhouse_credential.password,
            expressions=[dto.expression],
            variables=dto.variables,
            table=dto.table,
            database=dto.database,
        )
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")
    except DatabaseError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")


@router.post(
    "/workbooks/spreadsheets/columns/transient",
    response_model=ComputedSpreadsheetQueryResponse,
    dependencies=[Depends(validate_app_user)],
)
async def compute_transient_column(
    dto: TransientSpreadsheetColumnDto,
    spreadsheets_service: SpreadsheetService = Depends(),
    compute_query_action: ComputeQueryAction = Depends(),
):
    try:
        clickhouse_credential = await compute_query_action.get_clickhouse_credentials(
            datasource_id=dto.datasourceId
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


@router.get(
    "/workbooks/{id}",
    response_model=SavedWorkBookResponse,
    dependencies=[Depends(validate_library_items)],
)
async def get_workbook_by_id(
    id: str,
    spreadsheets_service: SpreadsheetService = Depends(),
):
    return await spreadsheets_service.get_workbook_by_id(workbook_id=id)


@router.put(
    "/workbooks/{id}",
    response_model=SavedWorkBookResponse,
    dependencies=[Depends(validate_app_user)],
)
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


@router.delete(
    "/workbooks/{workbook_id}",
    dependencies=[Depends(validate_library_items)],
)
async def delete_segments(
    workbook_id: str,
    spreadsheets_service: SpreadsheetService = Depends(),
):
    await spreadsheets_service.delete_workbook(workbook_id=workbook_id)


@router.delete("/workbooks/query/{id}")
def kill_workbook_query(id: str, spreadsheets_service: SpreadsheetService = Depends()):
    return spreadsheets_service.spreadsheets.kill_query(query_id=id)


@router.post(
    "/workbooks/spreadsheets/pivot/transient", dependencies=[Depends(validate_app_user)]
)
async def compute_transient_pivot(
    dto: ComputePivotDto,
    spreadsheets_service: SpreadsheetService = Depends(),
):
    try:
        return spreadsheets_service.compute_pivot(
            query=dto.query,
            rows=dto.rows,
            columns=dto.columns,
            values=dto.values,
        )
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")


@router.post("/workbooks/vlookup")
async def vlookup(
    dto: VlookupDto,
    spreadsheets_service: SpreadsheetService = Depends(),
    compute_query_action: ComputeQueryAction = Depends(),
):
    credential = await compute_query_action.get_clickhouse_credentials(
        datasource_id=dto.datasourceId
    )
    return await spreadsheets_service.compute_vlookup(
        search_query=dto.searchQuery,
        credential=credential,
        lookup_query=dto.lookupQuery,
        lookup_column=dto.lookupColumn,
        search_column=dto.searchKeyColumn,
        lookup_index_column=dto.lookupIndexColumn,
    )
