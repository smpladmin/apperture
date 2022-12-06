from datetime import datetime as dt
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from domain.datasources.service import DataSourceService
from domain.edge.service import EdgeService
from domain.events.service import EventsService
from rest.dtos.edges import (
    AggregatedEdgeResponse,
    NodeTrendResponse,
    NodeSankeyResponse,
    NodeSignificanceResponse,
)
from domain.edge.models import TrendType
from rest.middlewares import validate_jwt


router = APIRouter(
    tags=["datasource"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get("/datasources/{ds_id}/edges", response_model=list[AggregatedEdgeResponse])
async def get_edges(
    ds_id: str,
    start_date: str = "1970-01-01",
    end_date: str = dt.today().strftime("%Y-%m-%d"),
    edge_service: EdgeService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(ds_id)
    return await edge_service.get_edges(datasource, start_date, end_date)


@router.get("/datasources/{ds_id}/nodes")
async def get_edges(
    ds_id: str,
    event_service: EventsService = Depends(),
):
    return await event_service.get_unique_nodes(ds_id)


@router.get("/datasources/{ds_id}/trends", response_model=list[NodeTrendResponse])
async def get_trend_nodes(
    ds_id: str,
    node: str,
    trend_type: TrendType,
    start_date: str = "1970-01-01",
    end_date: str = dt.today().strftime("%Y-%m-%d"),
    edge_service: EdgeService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    is_entrance_node = True if node == "Entrance" else False
    datasource = await ds_service.get_datasource(ds_id)
    return await edge_service.get_node_trends(
        datasource=datasource,
        node=node,
        trend_type=trend_type,
        start_date=start_date,
        end_date=end_date,
        is_entrance_node=is_entrance_node,
    )


@router.get("/datasources/{ds_id}/sankey", response_model=list[NodeSankeyResponse])
async def get_sankey_nodes(
    ds_id: str,
    node: str,
    start_date: str = "1970-01-01",
    end_date: str = dt.today().strftime("%Y-%m-%d"),
    edge_service: EdgeService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(ds_id)
    return await edge_service.get_node_sankey(
        datasource=datasource, node=node, start_date=start_date, end_date=end_date
    )


@router.get(
    "/datasources/{ds_id}/node_significance",
    response_model=list[NodeSignificanceResponse],
)
async def get_node_significance(
    ds_id: str,
    node: str,
    start_date: str = "1970-01-01",
    end_date: str = dt.today().strftime("%Y-%m-%d"),
    edge_service: EdgeService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(ds_id)
    return await edge_service.get_node_significance(
        datasource=datasource, node=node, start_date=start_date, end_date=end_date
    )


@router.get(
    "/datasources/{ds_id}/event_properties",
)
async def get_event_properties(
    ds_id: str,
    chunk_size: int = 50,
    events_service: EventsService = Depends(),
):
    return StreamingResponse(events_service.get_event_properties(datasource_id=ds_id, chunk_size=chunk_size))
