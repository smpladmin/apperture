import asyncio
from typing import Union
from fastapi import APIRouter, Depends, Query
from domain.apps.models import App

from domain.apps.service import AppService
from domain.datasources.service import DataSourceService
from domain.integrations.models import Integration
from domain.integrations.service import IntegrationService
from domain.users.models import User
from rest.dtos.apps import AppResponse, AppWithIntegrations, CreateAppDto
from rest.dtos.datasources import DataSourceResponse
from rest.dtos.integrations import IntegrationWithDataSources
from rest.middlewares import get_user, get_user_id, validate_jwt


router = APIRouter(
    tags=["apps"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/apps", response_model=AppResponse)
async def create_app(
    app_dto: CreateAppDto,
    user: User = Depends(get_user),
    app_service: AppService = Depends(),
):
    return await app_service.create_app(app_dto.name, user)


@router.get("/apps", response_model=Union[list[AppWithIntegrations], list[AppResponse]])
async def get_apps(
    user: User = Depends(get_user),
    with_integrations: bool = Query(False),
    app_service: AppService = Depends(),
    integration_service: IntegrationService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    apps = await app_service.get_apps(user)
    if not with_integrations:
        return apps

    apps_wi = await asyncio.gather(
        *list(
            map(
                lambda app: build_app_with_integrations(
                    app,
                    integration_service,
                    ds_service,
                ),
                apps,
            )
        )
    )
    return apps_wi


@router.get("/apps/{id}", response_model=AppResponse)
async def get_app(
    id: str,
    user_id: str = Depends(get_user_id),
    app_service: AppService = Depends(),
):
    return await app_service.get_user_app(id, user_id)


async def build_app_with_integrations(
    app: App, integration_service: IntegrationService, ds_service: DataSourceService
):
    integrations = await integration_service.get_app_integrations(app.id)
    integraiton_wds = await asyncio.gather(
        *list(
            map(
                lambda integration: build_integration_with_datasources(
                    integration, ds_service
                ),
                integrations,
            )
        )
    )
    app_wi = AppWithIntegrations.from_orm(app)
    app_wi.integrations = integraiton_wds
    return app_wi


async def build_integration_with_datasources(
    integration: Integration,
    ds_service: DataSourceService,
):
    datasources = await ds_service.get_integration_datasources(integration.id)
    integration_wds = IntegrationWithDataSources.from_orm(integration)
    integration_wds.datasources = list(
        map(
            lambda ds: DataSourceResponse.from_orm(ds),
            datasources,
        )
    )
    return integration_wds
