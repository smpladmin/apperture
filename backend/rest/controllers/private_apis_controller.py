from datetime import datetime as dt
from dateutil.parser import parse
from fastapi import APIRouter, Depends, HTTPException
from domain.datasources.service import DataSourceService
from domain.edge.service import EdgeService
from domain.integrations.service import IntegrationService
from domain.runlogs.service import RunLogService
from rest.dtos.datasources import PrivateDataSourceResponse
from rest.dtos.edges import CreateEdgesDto, EdgeResponse
from rest.dtos.runlogs import CreateRunLogDto

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
            dt.strptime(e.date, "%Y-%m-%d"),
        )
        for e in dto.edges
    ]
    await edge_service.update_edges(edges, datasource.id)
    return {"updated": True}


@router.put("/runlogs", responses={404: {}})
async def update_runlog(
    dto: CreateRunLogDto,
    service: RunLogService = Depends(),
):
    runlog = await service.update(dto.datasource_id, parse(dto.date), dto.status)
    if runlog:
        return runlog
    raise HTTPException(
        status_code=404,
        detail=f"Runlog not found for - {dto.datasource_id} {dto.date}",
    )
