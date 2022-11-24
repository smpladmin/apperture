from datetime import datetime as dt
from fastapi import APIRouter, Depends
from domain.datasources.service import DataSourceService
from domain.edge.service import EdgeService
from rest.dtos.edges import (
    AggregatedEdgeResponse,
    NodeTrendResponse,
    NodeSankeyResponse,
    NodeSignificanceResponse,
)

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


@router.get("/datasources/{ds_id}/trends", response_model=list[NodeTrendResponse])
async def get_trend_nodes(
    ds_id: str,
    node: str,
    trend_type: str,
    start_date: str = "1970-01-01",
    end_date: str = dt.today().strftime("%Y-%m-%d"),
    edge_service: EdgeService = Depends(),
):
    is_entrance_node = True if node == "Entrance" else False
    return await edge_service.get_node_trends(
        ds_id, node, trend_type, start_date, end_date, is_entrance_node
    )


@router.get("/datasources/{ds_id}/sankey", response_model=list[NodeSankeyResponse])
async def get_sankey_nodes(
    ds_id: str,
    node: str,
    start_date: str = "1970-01-01",
    end_date: str = dt.today().strftime("%Y-%m-%d"),
    edge_service: EdgeService = Depends(),
):
    return await edge_service.get_node_sankey(ds_id, node, start_date, end_date)


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
