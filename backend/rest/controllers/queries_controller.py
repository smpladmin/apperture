from fastapi import APIRouter, Depends, HTTPException

from beanie import PydanticObjectId
from domain.queries.service import QueriesService
from domain.datasources.service import DataSourceService
from domain.spreadsheets.models import (
    ComputedSpreadsheetWithCustomHeaders,
)
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.spreadsheets import TransientSpreadsheetsDto
from rest.dtos.queries import (
    QueriesResponse,
    QueriesDto,
    QueriesTableDto,
    QueryComparisonDto,
)
from rest.middlewares import validate_jwt
from rest.middlewares.validate_app_user import validate_app_user, validate_library_items
from clickhouse_connect.driver.exceptions import DatabaseError
from utils.errors import BusinessError

router = APIRouter(
    tags=["queries"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


# Endpoint to run a single query
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


# Endpoint to save a query
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


# Endpoint to get a saved query by ID
@router.get(
    "/queries/{id}",
    response_model=QueriesResponse,
    dependencies=[Depends(validate_library_items)],
)
async def get_saved_queries(
    id: str,
    queries_service: QueriesService = Depends(),
):
    return await queries_service.get_query_data(id=id)


# Endpoint to compare two queries
@router.post(
    "/queries/compare",
    response_model=dict,
)
async def run_internal_queries(
    query_comparison_dto: QueryComparisonDto,
    compute_query_action: ComputeQueryAction = Depends(),
    queries_service: QueriesService = Depends(),
):
    try:
        query_ids = query_comparison_dto.query_ids
        key_columns = query_comparison_dto.key_columns
        compare_columns = query_comparison_dto.compare_columns

        if len(query_ids) < 2:
            raise HTTPException(
                status_code=400, detail="At least two query IDs must be provided."
            )

        query_id1, query_id2 = query_ids
        difference_df = await queries_service.compute_difference_between_queries(
            query_id1=query_id1,
            query_id2=query_id2,
            key_columns=key_columns,
            compare_columns=compare_columns,
            compute_query_action=compute_query_action,
        )
        result = difference_df.to_dict(orient="records")
        return {"data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
