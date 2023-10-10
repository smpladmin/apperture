from fastapi import Depends
from domain.apps.models import App
from domain.apps.service import AppService
from domain.common.models import IntegrationProvider
from domain.connections.service import ConnectionService
from domain.datamart.service import DataMartService
from domain.datasources.service import DataSourceService
from domain.integrations.service import IntegrationService
from domain.properties.service import PropertiesService


class AppConnectionsAction:
    def __init__(
        self,
        app_service: AppService = Depends(),
        datasource_service: DataSourceService = Depends(),
        integration_service: IntegrationService = Depends(),
        datamart_service: DataMartService = Depends(),
        properties_service: PropertiesService = Depends(),
        connections_service: ConnectionService = Depends(),
    ):
        self.app_service = app_service
        self.ds_service = datasource_service
        self.integration_service = integration_service
        self.datamart_service = datamart_service
        self.properties_service = properties_service
        self.connections_service = connections_service

    async def get_app_connections(self, app: App, allow_sql_connections: bool = True):
        clickhouse_credentials = app.clickhouse_credential
        all_datasources = await self.ds_service.get_datasources_for_app_id(
            app_id=app.id
        )
        properties_table = {}
        credentials_table = {}
        datamart_properties = {}
        datamarts = await self.datamart_service.get_datamart_tables_for_app_id(
            app_id=app.id
        )
        for datamart in datamarts:
            table = datamart.table_name
            property = self.connections_service.get_clickhouse_table_columns(
                username=clickhouse_credentials.username,
                password=clickhouse_credentials.password,
                database=clickhouse_credentials.databasename,
                table=table,
            )
            datamart_properties[str(datamart.id)] = {
                "fields": property,
                "database": clickhouse_credentials.databasename,
                "name": datamart.name,
                "table": table,
            }
        for datasource in all_datasources:
            if (
                datasource.provider == IntegrationProvider.MYSQL
                and allow_sql_connections
            ):
                details = await self.integration_service.get_mysql_connection_details(
                    id=datasource.integration_id
                )
                credentials_table[str(datasource.id)] = details
            elif (
                datasource.provider == IntegrationProvider.MSSQL
                and allow_sql_connections
            ):
                details = await self.integration_service.get_mssql_connection_details(
                    id=datasource.integration_id
                )
                credentials_table[str(datasource.id)] = details
            elif (
                datasource.provider == IntegrationProvider.CSV
                or datasource.provider == IntegrationProvider.SAMPLE
            ):
                integration = await self.integration_service.get_integration(
                    id=str(datasource.integration_id)
                )
                table = (
                    integration.credential.csv_credential.table_name
                    if datasource.provider == IntegrationProvider.CSV
                    else integration.credential.tableName
                )
                property = self.connections_service.get_clickhouse_table_columns(
                    username=clickhouse_credentials.username,
                    password=clickhouse_credentials.password,
                    database=clickhouse_credentials.databasename,
                    table=table,
                )
                properties_table[str(datasource.id)] = {
                    "fields": property,
                    "database": clickhouse_credentials.databasename,
                    "name": table,
                    "table": table,
                }
            else:
                property = await self.properties_service.fetch_properties(
                    ds_id=datasource.id
                )
                properties_table[str(datasource.id)] = {"fields": property}
        return self.connections_service.get_connections_from_datasources(
            datasources=all_datasources,
            properties_table=properties_table,
            credentials_table=credentials_table,
            datamarts=datamarts,
            datamart_properties=datamart_properties,
            allow_sql_connections=allow_sql_connections,
        )
