from fastapi import APIRouter, Depends

from domain.connections.service import ConnectionService
from domain.datasources.service import DataSourceService
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
):
    datasource = await ds_service.get_datasource(dsId)

    if datasource:
        app_id = datasource.app_id
        all_datasources = await ds_service.get_datasources_for_app_id(app_id=app_id)
        properties_table = {}
        credentials_table = {}
        for datasource in all_datasources:
            if datasource.provider == "mysql":
                details = await integration_service.get_mysql_connection_details(
                    id=datasource.integration_id
                )
                credentials_table[str(datasource.id)] = details
            else:
                property = await properties_service.fetch_properties(
                    ds_id=datasource.id
                )
                properties_table[str(datasource.id)] = {"fields": property}
        return connections_service.get_connections_from_datasources(
            datasources=all_datasources,
            properties_table=properties_table,
            credentials_table=credentials_table,
        )
