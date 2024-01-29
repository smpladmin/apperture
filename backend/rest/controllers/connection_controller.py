from fastapi import APIRouter, Depends, Query
from fastapi_cache.decorator import cache

from cache.cache import CACHE_EXPIRY_24_HOURS, clear_cache, connections_key_builder
from domain.apps.service import AppService
from domain.common.models import IntegrationProvider
from domain.connections.service import ConnectionService
from domain.datamart.service import DataMartService
from domain.datasources.service import DataSourceService
from domain.integrations.service import IntegrationService
from domain.properties.service import PropertiesService
from rest.controllers.actions.app_connections import AppConnectionsAction
from rest.middlewares import validate_jwt

router = APIRouter(
    tags=["connection"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get("/connections/{dsId}")
@cache(expire=CACHE_EXPIRY_24_HOURS, key_builder=connections_key_builder)
async def get_connections(
    dsId: str,
    appId: str = Query("", description="app id"),
    ds_service: DataSourceService = Depends(),
    app_connections_action: AppConnectionsAction = Depends(),
    app_service: AppService = Depends(),
):
    datasource = await ds_service.get_datasource(dsId)

    if datasource:
        app_id = datasource.app_id
        app = await app_service.get_app(id=str(appId or app_id))
        return await app_connections_action.get_app_connections(app=app)

    return []
