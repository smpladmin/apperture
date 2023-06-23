from typing import List

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends

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

router = APIRouter(
    tags=["data_mart"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/datamart/transient", response_model=ComputedSpreadsheetQueryResponse)
async def compute_datamart_query(
    dto: TransientSpreadsheetsDto, compute_query_action: ComputeQueryAction = Depends()
):
    return await compute_query_action.compute_query(dto=dto)


@router.post("/datamart", response_model=DataMartResponse)
async def save_datamart_table(
    dto: DataMartTableDto,
    datasource_service: DataSourceService = Depends(),
    datamart_service: DataMartService = Depends(),
    user_id: str = Depends(get_user_id),
):
    datasource = await datasource_service.get_datasource(dto.datasourceId)
    datamart_table = datamart_service.build_datamart_table(
        datasource_id=PydanticObjectId(dto.datasourceId),
        app_id=datasource.app_id,
        user_id=PydanticObjectId(user_id),
        name=dto.name,
        query=dto.query,
    )

    await datamart_service.create_datamart_table(table=datamart_table)
    return datamart_table


@router.put("/datamart/{id}", response_model=DataMartResponse)
async def update_datamart_table(
    id: str,
    dto: DataMartTableDto,
    datasource_service: DataSourceService = Depends(),
    datamart_service: DataMartService = Depends(),
    user_id: str = Depends(get_user_id),
):
    datasource = await datasource_service.get_datasource(dto.datasourceId)
    new_datamart_table = datamart_service.build_datamart_table(
        datasource_id=PydanticObjectId(dto.datasourceId),
        app_id=datasource.app_id,
        user_id=PydanticObjectId(user_id),
        name=dto.name,
        query=dto.query,
    )

    await datamart_service.update_datamart_table(table_id=id, new_table=new_datamart_table)
    return new_datamart_table


@router.get("/datamart/{id}", response_model=DataMartResponse)
async def get_saved_datamart_table(
    id: str,
    datamart_service: DataMartService = Depends(),
):
    return await datamart_service.get_datamart_table(id)


@router.get("/datamarts", response_model=List[DataMartWithUser])
async def get_datamarts(
    datasource_id: str,
    user: AppertureUser = Depends(get_user),
    datasource_service: DataSourceService = Depends(),
    datamart_service: DataMartService = Depends(),
):
    datasource = await datasource_service.get_datasource(datasource_id)
    datamarts = await datamart_service.get_datamarts_for_app_id(app_id=datasource.app_id)
    datamarts = [DataMartWithUser.from_orm(d) for d in datamarts]

    for datamart in datamarts:
        datamart.user = AppertureUserResponse.from_orm(user)
    return datamarts


@router.delete("/datamart/{id}")
async def delete_funnel(
    id: str,
    datamart_service: DataMartService = Depends(),
):
    await datamart_service.delete_datamart(datamart_id=id)
