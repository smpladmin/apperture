import asyncio
import logging
from typing import Union

from fastapi import APIRouter, Depends, HTTPException, Query, status

from domain.apperture_users.models import AppertureUser
from domain.apperture_users.service import AppertureUserService
from domain.apps.models import App
from domain.apps.service import AppService
from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSourceVersion
from domain.datasources.service import DataSourceService
from domain.integrations.models import Integration
from domain.integrations.service import IntegrationService
from rest.dtos.apps import (
    AppResponse,
    AppWithIntegrations,
    CreateAppDto,
    OrgAccessResponse,
    UpdateAppDto,
)
from rest.dtos.datasources import DataSourceResponse
from rest.dtos.integrations import IntegrationWithDataSources
from rest.middlewares import get_user, get_user_id, validate_jwt
from settings import apperture_settings

router = APIRouter(
    tags=["apps"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)

settings = apperture_settings()


@router.post("/apps", response_model=AppResponse)
async def create_app(
    app_dto: CreateAppDto,
    user: AppertureUser = Depends(get_user),
    app_service: AppService = Depends(),
    ds_service: DataSourceService = Depends(),
    integration_service: IntegrationService = Depends(),
):
    existing_app = await app_service.get_app_count_by_database_name(name=app_dto.name)
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please try creating an app with a different name.",
        )
    app = await app_service.create_app(app_dto.name, user, app_dto.remote_connection)
    app_count = await app_service.get_app_count(user.id)
    if app_count == 1:
        for table in settings.base_sample_tables:
            integration = await integration_service.create_integration(
                app,
                IntegrationProvider.SAMPLE,
                None,
                None,
                None,
                table,
                None,
                None,
                None,
            )
            await ds_service.create_datasource(
                None,
                f"Sample table {table}",
                DataSourceVersion.DEFAULT,
                integration,
            )
    return app


@router.get("/apps", response_model=Union[list[AppWithIntegrations], list[AppResponse]])
async def get_apps(
    user: AppertureUser = Depends(get_user),
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
                    user,
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
    user: AppertureUser = Depends(get_user),
    app_service: AppService = Depends(),
):
    return await app_service.get_shared_or_owned_app(id=id, user=user)


@router.put("/apps/{id}")
async def update_app(
    id: str,
    dto: UpdateAppDto,
    user: str = Depends(get_user),
    app_service: AppService = Depends(),
    user_service: AppertureUserService = Depends(),
):
    emails = dto.shareWithEmails
    app = None
    to_share_with = []
    if emails:
        emails = [email.lower() for email in emails]
        for email in emails:
            new_user = await user_service.get_user_by_email(email=email)
            if not new_user:
                logging.info(
                    f"User doesn't exist. Creating an invited user with email {email}"
                )
                new_user = await user_service.create_invited_user(email=email)
            to_share_with.append(new_user.id)
        app = await app_service.share_app(id, user, to_share_with)

    if dto.orgAccess != None:
        app = await app_service.switch_org_access(id=id, org_access=dto.orgAccess)

    return app


async def build_app_with_integrations(
    user: AppertureUser,
    app: App,
    integration_service: IntegrationService,
    ds_service: DataSourceService,
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
    app_wi.shared = user.id in app_wi.shared_with
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


@router.get("/apps/{id}/domain", response_model=OrgAccessResponse)
async def get_user_domain(
    id: str,
    app_service: AppService = Depends(),
):
    return await app_service.get_user_domain(app_id=id)
