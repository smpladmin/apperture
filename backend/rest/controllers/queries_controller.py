from fastapi import APIRouter, Depends, HTTPException

from rest.dtos.spreadsheets import TransientSpreadsheetsDto
from beanie import PydanticObjectId

from domain.queries.service import QueriesService
from domain.datasources.service import DataSourceService
from domain.spreadsheets.models import (
    ComputedSpreadsheetWithCustomHeaders,
)
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.queries import QueriesResponse, QueriesDto, QueriesTableDto

from rest.middlewares import validate_jwt
from rest.middlewares.validate_app_user import validate_app_user, validate_library_items
from clickhouse_connect.driver.exceptions import DatabaseError
from utils.errors import BusinessError

router = APIRouter(
    tags=["queries"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post(
    "/queries/run",
    response_model=ComputedSpreadsheetWithCustomHeaders,
    dependencies=[Depends(validate_app_user)],
)
async def compute_queries(
    dto: QueriesTableDto,
    compute_query_action: ComputeQueryAction = Depends(),
    queries_service: QueriesService = Depends(),
):
    try:
        query_data = await queries_service.get_query_data(dto.query_id)

        compute_dto = TransientSpreadsheetsDto(
            datasourceId=str(query_data.datasource_id),
            query=query_data.query,
            isDatamart=False,
            is_sql=True,
            ai_query=None,
        )
        result = await compute_query_action.compute_query(
            app_id=query_data.app_id, dto=compute_dto
        )
        result = compute_query_action.create_spreadsheet_with_custom_headers(
            column_names=result.headers, data=result.data, sql=result.sql
        )
        return result

    except BusinessError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")
    except DatabaseError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")


@router.post(
    "/queries",
    response_model=QueriesResponse,
    dependencies=[Depends(validate_app_user)],
)
async def save_queries(
    dto: QueriesDto,
    datasource_service: DataSourceService = Depends(),
    queries_service: QueriesService = Depends(),
):
    datasource = await datasource_service.get_datasource(id=dto.datasourceId)
    queries_table = queries_service.build_queries_table(
        datasource_id=PydanticObjectId(dto.datasourceId),
        app_id=datasource.app_id,
        query=dto.query,
        user_id=datasource.user_id,
    )
    return await queries_service.save_queries(queries=queries_table)


@router.get(
    "/queries/{id}",
    response_model=QueriesResponse,
    dependencies=[Depends(validate_library_items)],
)
async def get_saved_queries(
    id: str,
    datamart_service: QueriesService = Depends(),
):
    return await datamart_service.get_query_data(id=id)
