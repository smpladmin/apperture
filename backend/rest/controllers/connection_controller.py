from fastapi import APIRouter, Depends

from domain.apps.service import AppService
from domain.common.models import IntegrationProvider
from domain.connections.service import ConnectionService
from domain.datamart.service import DataMartService
from domain.datasources.service import DataSourceService
from domain.integrations.service import IntegrationService
from domain.properties.service import PropertiesService
from rest.middlewares import validate_jwt
from rest.controllers.actions.app_connections import AppConnectionsAction


router = APIRouter(
    tags=["connection"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get("/connections/{dsId}")
async def get_connections(
    dsId: str,
    ds_service: DataSourceService = Depends(),
    app_connections_action: AppConnectionsAction = Depends(),
    app_service: AppService = Depends(),
):
    datasource = await ds_service.get_datasource(dsId)

    if datasource:
        app_id = datasource.app_id
        app = await app_service.get_app(id=str(app_id))
        return await app_connections_action.get_app_connections(app=app)

    return []
