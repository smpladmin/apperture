import asyncio
import logging
from typing import Union

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile

from data_processor_queue.service import DPQueueService
from domain.apperture_users.models import AppertureUser
from domain.apps.service import AppService
from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSourceVersion, ProviderDataSource
from domain.datasources.service import DataSourceService
from domain.event_properties.service import EventPropertiesService
from domain.files.service import FilesService
from domain.integrations.models import RelationalDatabaseType
from domain.integrations.service import IntegrationService
from domain.runlogs.service import RunLogService
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.datasources import CreateDataSourceDto, DataSourceResponse
from rest.dtos.integrations import (
    CreateIntegrationDto,
    CSVCreateDto,
    DatabaseCredentialDto,
    DeleteCSVDto,
    IntegrationResponse,
)
from rest.middlewares import get_user, get_user_id, validate_jwt

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
    user: AppertureUser = Depends(get_user),
    app_service: AppService = Depends(),
    ds_service: DataSourceService = Depends(),
    integration_service: IntegrationService = Depends(),
    runlog_service: RunLogService = Depends(),
    dpq_service: DPQueueService = Depends(),
    files_service: FilesService = Depends(),
    event_property_service: EventPropertiesService = Depends(),
):
    if dto.databaseCredential:
        db_type = dto.databaseCredential.databaseType
        db_credential = integration_service.build_database_credential(
            host=dto.databaseCredential.host,
            port=dto.databaseCredential.port,
            username=dto.databaseCredential.username,
            password=dto.databaseCredential.password,
            databases=dto.databaseCredential.databases,
            over_ssh=dto.databaseCredential.overSsh,
            ssh_credential=dto.databaseCredential.sshCredential,
            database_type=db_type,
        )
        if db_type == RelationalDatabaseType.MYSQL:
            mysql_credential, mssql_credential = db_credential, None
        elif db_type == RelationalDatabaseType.MSSQL:
            mysql_credential, mssql_credential = None, db_credential
    else:
        mysql_credential, mssql_credential = None, None
    csv_credential = (
        await files_service.get_csv_credential(id=dto.csvFileId)
        if dto.csvFileId
        else None
    )
    branch_credential = (
        integration_service.build_branch_credential(
            app_id=dto.branchCredential.appId,
            branch_key=dto.branchCredential.branchKey,
            branch_secret=dto.branchCredential.branchSecret,
        )
        if dto.branchCredential
        else None
    )

    cdc_cred = dto.cdcCredential
    if cdc_cred:
        if not cdc_cred.tables:
            connection = integration_service.get_cdc_connection(host=cdc_cred.server, port=cdc_cred.port,
                                                                username=cdc_cred.username, password=cdc_cred.password)
            cdc_tables = integration_service.get_cdc_tables(connection=connection, database=cdc_cred.database)
        else:
            cdc_tables = cdc_cred.tables
        cdc_credential = integration_service.build_cdc_credential(
                server=cdc_cred.server,
                port=cdc_cred.port,
                username=cdc_cred.username,
                password=cdc_cred.password,
                server_type=cdc_cred.serverType,
                database=cdc_cred.database,
                tables=cdc_tables,
            )
    else:
        cdc_credential = None

    app = await app_service.get_shared_or_owned_app(id=dto.appId, user=user)
    api_base_url = None
    if dto.provider is IntegrationProvider.CLEVERTAP:
        api_base_url = "https://eu1.api.clevertap.com/1/events.json"

    integration = await integration_service.create_integration(
        app,
        dto.provider,
        dto.accountId,
        dto.apiKey,
        dto.apiSecret,
        dto.tableName,
        mysql_credential,
        mssql_credential,
        cdc_credential,
        csv_credential,
        branch_credential,
        api_base_url=api_base_url,
    )

    if cdc_credential and app.clickhouse_credential:
        await integration_service.create_cdc_tables(
            cdc_credential=cdc_credential,
            app_id=str(app.id),
            ch_db=app.clickhouse_credential.databasename,
        )
        integration_service.create_cdc_connector(
            credential=cdc_credential, tables=cdc_credential.tables, integration_id=integration.id
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
                datasource_id=datasource.id,
                username=app.clickhouse_credential.username,
                app_id=str(app.id),
            )

        if dto.eventList:
            for event in dto.eventList:
                await event_property_service.create_event_properties(
                    datasource_id=datasource.id,
                    event_name=event,
                    properties=[],
                    provider=dto.provider,
                )

        if trigger_data_processor:
            runlogs = await runlog_service.create_runlogs(datasource.id)
            jobs = dpq_service.enqueue_from_runlogs(runlogs)
            logging.info(f"Scheduled {len(jobs)} for data processing")

        response = IntegrationResponse.from_orm(integration)
        response.datasource = datasource
        return response

    return integration


@router.post("/integrations/database/test")
async def check_database_connection(
    dto: DatabaseCredentialDto,
    integration_service: IntegrationService = Depends(),
):
    return integration_service.test_database_connection(
        host=dto.host,
        port=dto.port,
        username=dto.username,
        password=dto.password,
        ssh_credential=dto.sshCredential,
        database_type=dto.databaseType,
    )


@router.post("/integrations/csv/upload")
async def upload_csv(
    file: UploadFile = File(...),
    appId: str = Form(...),
    integration_service: IntegrationService = Depends(),
    files_service: FilesService = Depends(),
):
    try:
        filename = file.filename.replace(" ", "_")
        s3_key = files_service.build_s3_key(app_id=appId, filename=filename)
        integration_service.upload_csv_to_s3(file=file, s3_key=s3_key)
        logging.info("CSV uploaded successfully to S3.")
        return await files_service.add_file(
            filename=filename, s3_key=s3_key, app_id=appId
        )

    except Exception as e:
        logging.info(f"Exception occured while uploading csv: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/integrations/csv/create")
async def create_table_with_csv(
    dto: CSVCreateDto,
    integration_service: IntegrationService = Depends(),
    compute_query_action: ComputeQueryAction = Depends(),
    files_service: FilesService = Depends(),
):
    try:
        file = await files_service.get_file(id=dto.fileId)
        clickhouse_credential = await compute_query_action.get_clickhouse_credentials(
            datasource_id=dto.datasourceId
        )
        integration_service.create_clickhouse_table_from_csv(
            name=file.table_name,
            clickhouse_credential=clickhouse_credential,
            s3_key=file.s3_key,
        )
    except Exception as e:
        logging.info(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/integrations/csv/delete")
async def delete_file_from_s3(
    dto: DeleteCSVDto,
    integration_service: IntegrationService = Depends(),
    files_service: FilesService = Depends(),
):
    try:
        s3_key = files_service.build_s3_key(app_id=dto.appId, filename=dto.filename)
        integration_service.delete_file_from_s3(s3_key=s3_key)
        logging.info(f"File deleted successfully from S3: {dto.filename}")

    except Exception as e:
        logging.info(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/integrations/{dsId}/events")
async def get_datasource_events(
    dsId: str,
    event_property_service: EventPropertiesService = Depends(),
):
    event_properties = await event_property_service.get_event_properties_for_datasource(
        datasource_id=dsId
    )

    return [properties.event for properties in event_properties]
