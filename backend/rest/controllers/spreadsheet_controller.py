from clickhouse_connect.driver.exceptions import DatabaseError
from fastapi import APIRouter, Depends, HTTPException

from ai.text_to_sql import text_to_sql
from domain.datasources.service import DataSourceService
from domain.event_properties.service import EventPropertiesService
from domain.spreadsheets.service import SpreadsheetService
from repositories.clickhouse.parser.query_parser import BusinessError
from rest.dtos.spreadsheets import (
    ComputedSpreadsheetQueryResponse,
    TransientSpreadsheetsDto,
)
from rest.middlewares import validate_jwt

router = APIRouter(
    tags=["spreadsheets"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/spreadsheets/transient", response_model=ComputedSpreadsheetQueryResponse)
async def compute_transient_spreadsheets(
    dto: TransientSpreadsheetsDto,
    spreadsheets_service: SpreadsheetService = Depends(),
    datasource_service: DataSourceService = Depends(),
):
    try:
        datasource = await datasource_service.get_datasource(dto.datasourceId)

        clickhouse_credential = (
            datasource.clickhouse_credential
            if datasource.clickhouse_credential
            else await datasource_service.create_clickhouse_credential_and_user_policy(
                dto.datasourceId
            )
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
