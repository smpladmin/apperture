from datetime import datetime as dt
from typing import List, Union

from fastapi import APIRouter, Depends
from fastapi_cache.decorator import cache
from cache.cache import (
    CACHE_EXPIRY_24_HOURS,
    datasource_key_builder,
    CACHE_EXPIRY_10_MINUTES,
)
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
from domain.properties.service import PropertiesService
from rest.dtos.events import EventsResponse
from rest.middlewares import validate_jwt


router = APIRouter(
    tags=["datasource"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get("/datasources/{ds_id}/edges", response_model=list[AggregatedEdgeResponse])
@cache(expire=CACHE_EXPIRY_24_HOURS, key_builder=datasource_key_builder)
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
@cache(expire=CACHE_EXPIRY_10_MINUTES, key_builder=datasource_key_builder)
async def get_nodes(
    ds_id: str,
    event_service: EventsService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(ds_id)
    return await event_service.get_unique_nodes(datasource)


@router.get("/datasources/{ds_id}/trends", response_model=list[NodeTrendResponse])
@cache(expire=CACHE_EXPIRY_24_HOURS, key_builder=datasource_key_builder)
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
@cache(expire=CACHE_EXPIRY_24_HOURS, key_builder=datasource_key_builder)
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
@cache(expire=CACHE_EXPIRY_24_HOURS, key_builder=datasource_key_builder)
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


@router.get("/datasources/{ds_id}/event_properties", response_model=List[str])
async def get_event_properties(
    ds_id: str,
    properties_service: PropertiesService = Depends(),
):
    return await properties_service.fetch_properties(ds_id=ds_id)


@router.get("/datasources/{ds_id}/property_values", response_model=List[List[str]])
async def get_event_property_values(
    ds_id: str,
    event_property: str,
    start_date: str = "1970-01-01",
    end_date: str = dt.today().strftime("%Y-%m-%d"),
    events_service: EventsService = Depends(),
):
    return events_service.get_values_for_property(
        datasource_id=ds_id,
        event_property=event_property,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/datasources/{ds_id}/events", response_model=EventsResponse)
async def get_events(
    ds_id: str,
    table_name: str = "events",
    page_number: int = 0,
    page_size: int = 100,
    user_id: Union[str, None] = None,
    is_aux: bool = False,
    events_service: EventsService = Depends(),
):
    return events_service.get_events(
        datasource_id=ds_id,
        is_aux=is_aux,
        table_name=table_name,
        user_id=user_id,
        page_number=page_number,
        page_size=page_size,
    )
