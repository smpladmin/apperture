import logging
from typing import List

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

from domain.apperture_users.models import AppertureUser
from domain.apps.service import AppService
from domain.datamart.service import DataMartService
from domain.datasources.service import DataSourceService
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.datamart import DataMartTableDto, DataMartResponse, DataMartWithUser
from rest.dtos.spreadsheets import (
    ComputedSpreadsheetQueryResponse,
    TransientSpreadsheetsDto,
)
from rest.middlewares import validate_jwt, get_user_id, get_user
from rest.middlewares.validate_app_user import validate_app_user, validate_library_items

router = APIRouter(
    tags=["datamart"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post(
    "/datamart/transient",
    response_model=ComputedSpreadsheetQueryResponse,
    dependencies=[Depends(validate_app_user)],
)
async def compute_datamart_query(
    dto: TransientSpreadsheetsDto, compute_query_action: ComputeQueryAction = Depends()
):
    return await compute_query_action.compute_query(dto=dto)


@router.post(
    "/datamart",
    response_model=DataMartResponse,
    dependencies=[Depends(validate_app_user)],
)
async def save_datamart_table(
    dto: DataMartTableDto,
    datasource_service: DataSourceService = Depends(),
    datamart_service: DataMartService = Depends(),
    app_service: AppService = Depends(),
    user_id: str = Depends(get_user_id),
):
    datasource = await datasource_service.get_datasource(id=dto.datasourceId)
    app = await app_service.get_app(id=datasource.app_id)
    if not app.clickhouse_credential:
        logging.info(f"Restricted user db doesn't exist for app!")
        raise HTTPException(
            status_code=401,
            detail=f"Restricted user db doesn't exist for app: {str(app.id)}",
        )

    datamart_table = datamart_service.build_datamart_table(
        datasource_id=PydanticObjectId(dto.datasourceId),
        app_id=datasource.app_id,
        user_id=user_id,
        name=dto.name,
        query=dto.query,
    )

    await datamart_service.create_datamart_table(
        table=datamart_table, clickhouse_credential=app.clickhouse_credential
    )
    return datamart_table


@router.put(
    "/datamart/{id}",
    response_model=DataMartResponse,
    dependencies=[Depends(validate_app_user)],
)
async def update_datamart_table(
    id: str,
    dto: DataMartTableDto,
    datasource_service: DataSourceService = Depends(),
    app_service: AppService = Depends(),
    datamart_service: DataMartService = Depends(),
    user_id: str = Depends(get_user_id),
):
    datasource = await datasource_service.get_datasource(dto.datasourceId)
    app = await app_service.get_app(id=datasource.app_id)
    if not app.clickhouse_credential:
        logging.info(f"Restricted user db doesn't exist for app!")
        raise HTTPException(
            status_code=401,
            detail=f"Restricted user db doesn't exist for app: {str(app.id)}",
        )

    new_datamart_table = datamart_service.build_datamart_table(
        datasource_id=PydanticObjectId(dto.datasourceId),
        app_id=datasource.app_id,
        user_id=user_id,
        name=dto.name,
        query=dto.query,
    )

    await datamart_service.update_datamart_table(
        table_id=id,
        new_table=new_datamart_table,
        clickhouse_credential=app.clickhouse_credential,
    )
    return new_datamart_table


@router.get(
    "/datamart/{id}",
    response_model=DataMartResponse,
    dependencies=[Depends(validate_library_items)],
)
async def get_saved_datamart_table(
    id: str,
    datamart_service: DataMartService = Depends(),
):
    return await datamart_service.get_datamart_table(id=id)


@router.get(
    "/datamart",
    response_model=List[DataMartWithUser],
    dependencies=[Depends(validate_app_user)],
)
async def get_datamart_tables(
    datasource_id: str,
    user: AppertureUser = Depends(get_user),
    datasource_service: DataSourceService = Depends(),
    datamart_service: DataMartService = Depends(),
):
    datasource = await datasource_service.get_datasource(id=datasource_id)
    datamarts = await datamart_service.get_datamart_tables_for_app_id(
        app_id=datasource.app_id
    )
    datamarts = [DataMartWithUser.from_orm(d) for d in datamarts]

    for datamart in datamarts:
        datamart.user = AppertureUserResponse.from_orm(user)
    return datamarts


@router.delete(
    "/datamart/{id}",
    dependencies=[Depends(validate_library_items)],
)
async def delete_datamart_table(
    id: str,
    datamart_service: DataMartService = Depends(),
    app_service: AppService = Depends(),
):
    existing_table = await datamart_service.get_datamart_table(id=id)
    app = await app_service.get_app(id=str(existing_table.app_id))
    if not app.clickhouse_credential:
        logging.info(f"Restricted user db doesn't exist for app!")
        raise HTTPException(
            status_code=401,
            detail=f"Restricted user db doesn't exist for app: {str(app.id)}!",
        )

    await datamart_service.delete_datamart_table(
        datamart_id=id,
        table_name=existing_table.table_name,
        clickhouse_credential=app.clickhouse_credential,
    )
