from fastapi import APIRouter, Depends
from domain.datasources.service import DataSourceService
from domain.edge.service import EdgeService
from domain.cleaned_data.service import CleanedDataService
from domain.integrations.service import IntegrationService
from rest.dtos.datasources import PrivateDataSourceResponse
from rest.dtos.edges import CreateEdgesDto, EdgeResponse
from rest.dtos.cleaned_data import CreateCleanedDataRowsDto, CleanedDataResponse

from rest.middlewares import validate_api_key


router = APIRouter(
    tags=["private"],
    dependencies=[Depends(validate_api_key)],
    responses={401: {}},
    prefix="/private",
)


@router.get("/datasources/{id}")
async def get_datasource_with_credentials(
    id: str,
    ds_service: DataSourceService = Depends(),
    integration_service: IntegrationService = Depends(),
):
    datasource = await ds_service.get_datasource(id)
    integration = await integration_service.get_integration(datasource.integration_id)
    return PrivateDataSourceResponse(
        datasource=datasource,
        credential=integration.credential,
    )


@router.post("/edges")
async def update_edges(
    dto: CreateEdgesDto,
    ds_service: DataSourceService = Depends(),
    edge_service: EdgeService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    edges = [
        edge_service.build(
            dto.datasourceId,
            dto.provider,
            e.previousEvent,
            e.currentEvent,
            e.users,
            e.hits,
        )
        for e in dto.edges
    ]
    await edge_service.update_edges(edges, datasource.id)
    return {"updated": True}


@router.post("/cleaned_data")
async def update_cleaned_data(
    dto: CreateCleanedDataRowsDto,
    ds_service: DataSourceService = Depends(),
    data_service: CleanedDataService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    rows = [
        data_service.build(
            dto.datasourceId,
            dto.provider,
            r.previousEvent,
            r.currentEvent,
            r.users,
            r.hits,
            r.date,
        )
        for r in dto.rows
    ]
    print('success')
    await data_service.update_data(rows, datasource.id)
    return {"updated": True}
