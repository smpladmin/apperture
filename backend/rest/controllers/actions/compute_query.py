import logging
from typing import List, Union

from clickhouse_connect.driver.exceptions import DatabaseError
from fastapi import Depends, HTTPException

from ai.text_to_sql import text_to_sql
from domain.apps.models import ClickHouseCredential
from domain.apps.service import AppService
from domain.common.models import IntegrationProvider
from domain.datasources.service import DataSourceService
from domain.integrations.models import MySQLCredential
from domain.integrations.service import IntegrationService
from domain.spreadsheets.models import DatabaseClient
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

    async def get_credentials(
        self, datasource_id: str
    ) -> Union[ClickHouseCredential, MySQLCredential]:
        datasource = await self.datasource_service.get_datasource(datasource_id)
        if datasource.provider == IntegrationProvider.MYSQL:
            integration = await self.integration_service.get_integration(
                id=str(datasource.integration_id)
            )
            return integration.credential.mysql_credential
        else:
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

    async def get_database_client(self, datasource_id: str) -> DatabaseClient:
        datasource = await self.datasource_service.get_datasource(datasource_id)
        return (
            DatabaseClient.MYSQL
            if datasource.provider == IntegrationProvider.MYSQL
            else DatabaseClient.CLICKHOUSE
        )

    async def compute_query(self, dto: TransientSpreadsheetsDto):
        try:
            logging.info(f"Query: {dto.query}")
            credential = await self.get_credentials(dto.datasourceId)
            client = await self.get_database_client(datasource_id=dto.datasourceId)

            if not dto.is_sql:
                sql_query = text_to_sql(dto.ai_query)
                return await self.spreadsheets_service.get_transient_spreadsheets(
                    query=sql_query, credential=credential, client=client
                )
            return await self.spreadsheets_service.get_transient_spreadsheets(
                query=dto.query, credential=credential, client=client
            )
        except BusinessError as e:
            raise HTTPException(
                status_code=400, detail=str(e) or "Something went wrong"
            )
        except DatabaseError as e:
            raise HTTPException(
                status_code=400, detail=str(e) or "Something went wrong"
            )
