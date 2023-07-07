import asyncio
import logging
from typing import Union
from fastapi import APIRouter, Depends, Query
from data_processor_queue.service import DPQueueService
from domain.apps.service import AppService
from domain.datasources.models import DataSourceVersion, ProviderDataSource

from domain.runlogs.service import RunLogService
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
    trigger_data_processor: bool = Query(None),
    user_id: str = Depends(get_user_id),
    ds_service: DataSourceService = Depends(),
    integration_service: IntegrationService = Depends(),
    dpq_service: DPQueueService = Depends(),
    app_service: AppService = Depends(),
):
    integration = await integration_service.get_user_integration(id, user_id)
    app = await app_service.get_app(id=integration.app_id)

    ds_promises = [
        ds_service.create_datasource(
            ds.externalSourceId,
            ds.name,
            ds.version,
            integration,
        )
        for ds in datasource_dtos
    ]
    datasources = await asyncio.gather(*ds_promises)

    if app.clickhouse_credential:
        ds_service.create_user_policy_for_all_datasources(
            datasources=datasources, username=app.clickhouse_credential.username
        )

    if trigger_data_processor:
        jobs = [dpq_service.enqueue(str(ds.id)) for ds in datasources]

        logging.info(
            f"Scheduled jobs - {jobs} for datasources - {[ds.id for ds in datasources]}"
        )
    return datasources


@router.post("/integrations", response_model=IntegrationResponse)
async def create_integration(
    dto: CreateIntegrationDto,
    create_datasource: bool = False,
    trigger_data_processor: bool = False,
    user_id: str = Depends(get_user_id),
    app_service: AppService = Depends(),
    ds_service: DataSourceService = Depends(),
    integration_service: IntegrationService = Depends(),
    runlog_service: RunLogService = Depends(),
    dpq_service: DPQueueService = Depends(),
):
    app = await app_service.get_user_app(dto.appId, user_id)
    integration = await integration_service.create_integration(
        app,
        dto.provider,
        dto.accountId,
        dto.apiKey,
        dto.apiSecret,
        dto.tableName,
    )

    if create_datasource:
        datasource = await ds_service.create_datasource(
            dto.accountId,
            None,
            DataSourceVersion.DEFAULT,
            integration,
        )

        if app.clickhouse_credential:
            ds_service.create_row_policy_for_username(
                datasource_id=datasource.id, username=app.clickhouse_credential.username
            )

        if trigger_data_processor:
            runlogs = await runlog_service.create_runlogs(datasource.id)
            jobs = dpq_service.enqueue_from_runlogs(runlogs)
            logging.info(f"Scheduled {len(jobs)} for data processing")

        response = IntegrationResponse.from_orm(integration)
        response.datasource = datasource
        return response

    return integration
