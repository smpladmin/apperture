import logging
from typing import List, Union

from clickhouse_connect.driver.exceptions import DatabaseError
from fastapi import Depends, HTTPException

from ai.text_to_sql import text_to_sql
from domain.apps.models import ClickHouseCredential
from domain.apps.service import AppService
from domain.common.models import IntegrationProvider
from domain.datasources.service import DataSourceService
from domain.integrations.models import MsSQLCredential, MySQLCredential
from domain.integrations.service import IntegrationService
from domain.spreadsheets.models import (
    ColumnType,
    ComputedSpreadsheet,
    ComputedSpreadsheetWithCustomHeaders,
    DatabaseClient,
    SpreadSheetColumn,
)
from domain.spreadsheets.service import SpreadsheetService
from rest.dtos.spreadsheets import TransientSpreadsheetsDto
from utils.errors import BusinessError


class ComputeQueryAction:
    def __init__(
        self,
        spreadsheets_service: SpreadsheetService = Depends(),
        datasource_service: DataSourceService = Depends(),
        integration_service: IntegrationService = Depends(),
        app_service: AppService = Depends(),
    ):
        self.spreadsheets_service = spreadsheets_service
        self.datasource_service = datasource_service
        self.app_service = app_service
        self.integration_service = integration_service

    async def get_clickhouse_credentials(self, datasource_id: str):
        datasource = await self.datasource_service.get_datasource(datasource_id)
        app = await self.app_service.get_app(id=datasource.app_id)
        has_app_credential = bool(app.clickhouse_credential)

        clickhouse_credential = (
            app.clickhouse_credential
            if has_app_credential
            else await self.app_service.create_clickhouse_user(
                id=app.id, app_name=app.name
            )
        )

        if not has_app_credential:
            await self.datasource_service.create_row_policy_for_datasources_by_app(
                app=app, username=clickhouse_credential.username
            )

        return clickhouse_credential

    async def get_credentials(
        self,
        datasource_id: str,
        is_datamart=False,
    ) -> Union[ClickHouseCredential, MySQLCredential, MsSQLCredential]:
        datasource = await self.datasource_service.get_datasource(datasource_id)
        provider = datasource.provider
        if (
            provider in [IntegrationProvider.MYSQL, IntegrationProvider.MSSQL]
        ) and not is_datamart:
            integration = await self.integration_service.get_integration(
                id=str(datasource.integration_id)
            )
            if provider == IntegrationProvider.MYSQL:
                return integration.credential.mysql_credential
            elif provider == IntegrationProvider.MSSQL:
                return integration.credential.mssql_credential
        else:
            return await self.get_clickhouse_credentials(datasource_id=datasource_id)

    async def get_database_client(self, datasource_id: str) -> DatabaseClient:
        datasource = await self.datasource_service.get_datasource(datasource_id)
        provider = datasource.provider
        if provider == IntegrationProvider.MYSQL:
            return DatabaseClient.MYSQL
        elif provider == IntegrationProvider.MSSQL:
            return DatabaseClient.MSSQL
        else:
            return DatabaseClient.CLICKHOUSE

    async def get_transient_spreadsheets(
        self,
        app_id: str,
        query: str,
        credential: Union[ClickHouseCredential, MySQLCredential, MsSQLCredential],
        client: DatabaseClient,
        query_id: Union[str, None] = None,
    ) -> ComputedSpreadsheet:
        return await self.spreadsheets_service.get_transient_spreadsheets(
            app_id=app_id,
            query=query,
            credential=credential,
            query_id=query_id,
            client=client,
        )

    async def compute_query(self, app_id: str, dto: TransientSpreadsheetsDto):
        try:
            logging.info(f"Query: {dto.query}")
            credential = await self.get_credentials(
                datasource_id=dto.datasourceId, is_datamart=dto.isDatamart
            )
            if dto.isDatamart:
                client = DatabaseClient.CLICKHOUSE
            else:
                client = await self.get_database_client(datasource_id=dto.datasourceId)

            if not dto.is_sql:
                sql_query = text_to_sql(dto.ai_query)
                return await self.get_transient_spreadsheets(
                    app_id=app_id,
                    query=sql_query,
                    credential=credential,
                    client=client,
                    query_id=dto.query_id,
                )
            return await self.get_transient_spreadsheets(
                app_id=app_id,
                query=dto.query,
                credential=credential,
                client=client,
                query_id=dto.query_id,
            )
        except BusinessError as e:
            raise HTTPException(
                status_code=400, detail=str(e) or "Something went wrong"
            )
        except DatabaseError as e:
            raise HTTPException(
                status_code=400, detail=str(e) or "Something went wrong"
            )

    def create_spreadsheet_with_custom_headers(
        self, column_names: List[str], data: List[List], sql: str
    ) -> ComputedSpreadsheetWithCustomHeaders:
        headers = [
            SpreadSheetColumn(name=name, type=ColumnType.QUERY_HEADER)
            for name in column_names
        ]
        data_dict = []

        for idx, row in enumerate(data):
            row_data = {}
            for col_idx, column_name in enumerate(column_names):
                row_data[column_name] = row[col_idx]
            data_dict.append(row_data)

        return ComputedSpreadsheetWithCustomHeaders(
            data=data_dict, headers=headers, sql=sql
        )
