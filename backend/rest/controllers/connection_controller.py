from fastapi import APIRouter, Depends

from domain.apps.service import AppService
from domain.connections.service import ConnectionService
from domain.datamart.service import DataMartService
from domain.datasources.service import DataSourceService
from domain.files.service import FilesService
from domain.integrations.service import IntegrationService
from domain.properties.service import PropertiesService
from rest.middlewares import validate_jwt

router = APIRouter(
    tags=["connection"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get("/connections/{dsId}")
async def get_clickstream_events(
    dsId: str,
    ds_service: DataSourceService = Depends(),
    connections_service: ConnectionService = Depends(),
    properties_service: PropertiesService = Depends(),
    integration_service: IntegrationService = Depends(),
    app_service: AppService = Depends(),
    datamart_service: DataMartService = Depends(),
):
    datasource = await ds_service.get_datasource(dsId)

    if datasource:
        app_id = datasource.app_id
        app = await app_service.get_app(id=str(app_id))
        clickhouse_credentials = app.clickhouse_credential
        all_datasources = await ds_service.get_datasources_for_app_id(app_id=app_id)
        properties_table = {}
        credentials_table = {}
        datamart_properties = {}
        datamarts = await datamart_service.get_datamart_tables_for_app_id(app_id=app_id)
        for datamart in datamarts:
            table = datamart.table_name
            property = connections_service.get_clickhouse_table_columns(
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
            if datasource.provider == "mysql":
                details = await integration_service.get_mysql_connection_details(
                    id=datasource.integration_id
                )
                credentials_table[str(datasource.id)] = details
            elif datasource.provider == "csv":
                integration = await integration_service.get_integration(
                    id=str(datasource.integration_id)
                )
                table = integration.credential.csv_credential.table_name
                property = connections_service.get_clickhouse_table_columns(
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
                property = await properties_service.fetch_properties(
                    ds_id=datasource.id
                )
                properties_table[str(datasource.id)] = {"fields": property}
        return connections_service.get_connections_from_datasources(
            datasources=all_datasources,
            properties_table=properties_table,
            credentials_table=credentials_table,
            datamarts=datamarts,
            datamart_properties=datamart_properties,
        )
