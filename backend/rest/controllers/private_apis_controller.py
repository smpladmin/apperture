from fastapi import APIRouter, Depends
from domain.datasources.service import DataSourceService
from domain.edge.service import EdgeService
from domain.integrations.service import IntegrationService
from rest.dtos.datasources import PrivateDataSourceResponse
from rest.dtos.edges import CreateEdgesDto, EdgeResponse

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


@router.post("/edges", response_model=list[EdgeResponse])
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
    return await edge_service.update_edges(edges, datasource.id)
