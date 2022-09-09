import asyncio
from typing import Union
from fastapi import APIRouter, Depends
from domain.apps.service import AppService
from domain.datasources.models import DataSourceVersion, ProviderDataSource

from domain.datasources.service import DataSourceService
from domain.integrations.service import IntegrationService
from rest.dtos.datasources import CreateDataSourceDto, DataSourceResponse
from rest.dtos.integrations import CreateIntegrationDto, IntegrationResponse
from rest.middlewares import get_user_id, validate_jwt


router = APIRouter(
    tags=["integration"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get(
    "/integrations/{id}/datasources",
    response_model=Union[list[ProviderDataSource], list[DataSourceResponse]],
)
async def get_datasources(
    id: str,
    from_provider: bool = False,
    user_id: str = Depends(get_user_id),
    integration_service: IntegrationService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    if from_provider:
        integration = await integration_service.get_user_integration(id, user_id)
        datasources = await ds_service.get_provider_datasources(
            integration.provider, integration.credential
        )
        return datasources
    return await ds_service.get_datasources(id)


@router.post("/integrations/{id}/datasources", response_model=list[DataSourceResponse])
async def create_datasources(
    id: str,
    datasource_dtos: list[CreateDataSourceDto],
    user_id: str = Depends(get_user_id),
    ds_service: DataSourceService = Depends(),
    integration_service: IntegrationService = Depends(),
):
    integration = await integration_service.get_user_integration(id, user_id)
    ds_promises = [
        ds_service.create_datasource(
            ds.externalSourceId,
            ds.name,
            ds.version,
            integration,
        )
        for ds in datasource_dtos
    ]
    return await asyncio.gather(*ds_promises)


@router.post("/integrations", response_model=IntegrationResponse)
async def create_integration(
    dto: CreateIntegrationDto,
    create_datasource: bool = False,
    user_id: str = Depends(get_user_id),
    app_service: AppService = Depends(),
    ds_service: DataSourceService = Depends(),
    integration_service: IntegrationService = Depends(),
):
    app = await app_service.get_user_app(dto.appId, user_id)
    integration = await integration_service.create_integration(
        app,
        dto.provider,
        dto.accountId,
        dto.apiKey,
        dto.apiSecret,
    )

    if create_datasource:
        datasource = await ds_service.create_datasource(
            dto.accountId,
            None,
            DataSourceVersion.DEFAULT,
            integration,
        )

        response = IntegrationResponse.from_orm(integration)
        response.datasource = datasource
        return response

    return integration
