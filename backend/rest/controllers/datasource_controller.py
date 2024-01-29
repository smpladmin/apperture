import logging
from datetime import datetime as dt
from typing import List, Union

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends
from fastapi_cache.decorator import cache

from cache.cache import (
    CACHE_EXPIRY_10_MINUTES,
    CACHE_EXPIRY_24_HOURS,
    clear_cache,
    datasource_key_builder,
)
from data_processor_queue.service import DPQueueService
from domain.actions.service import ActionService
from domain.clickstream_event_properties.service import (
    ClickStreamEventPropertiesService,
)
from domain.common.models import CaptureEvent, IntegrationProvider
from domain.datasources.models import DataSource
from domain.datasources.service import DataSourceService
from domain.edge.models import Node, TrendType
from domain.edge.service import EdgeService
from domain.event_properties.service import EventPropertiesService
from domain.events.service import EventsService
from domain.integrations.models import Credential
from domain.integrations.service import IntegrationService
from domain.properties.service import PropertiesService
from domain.runlogs.service import RunLogService
from rest.dtos.datasources import DataSourceResponse, DiffEventIngestionDto
from rest.dtos.edges import (
    AggregatedEdgeResponse,
    NodeSankeyResponse,
    NodeSignificanceResponse,
    NodeTrendResponse,
)
from rest.dtos.events import EventsResponse
from rest.dtos.integrations import CredentialDto
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
    action_service: ActionService = Depends(),
    event_properties_service: EventPropertiesService = Depends(),
    clickstream_event_properties_service: ClickStreamEventPropertiesService = Depends(),
):
    datasource = await ds_service.get_datasource(id=ds_id)
    event_properties = (
        await event_properties_service.get_event_properties_for_datasource(
            datasource_id=ds_id
        )
    )
    events = await event_service.get_unique_events(datasource=datasource)
    event_props_dict = {item.event: item.properties for item in event_properties}

    if datasource.provider == IntegrationProvider.APPERTURE:
        actions = await action_service.get_actions_for_datasource_id(
            datasource_id=ds_id
        )
        clickstream_event_properties = (
            await clickstream_event_properties_service.get_event_properties()
        )

        props_map = {
            CaptureEvent.AUTOCAPTURE: action_service.get_props(
                event_type=CaptureEvent.AUTOCAPTURE,
                clickstream_event_properties=clickstream_event_properties,
            ),
            CaptureEvent.PAGEVIEW: action_service.get_props(
                event_type=CaptureEvent.PAGEVIEW,
                clickstream_event_properties=clickstream_event_properties,
            ),
        }

        for action in actions:
            event_types = {group.event for group in action.groups}
            action_props = []
            for event_type in event_types:
                if event_type:
                    action_props = action_props + [
                        item
                        for item in props_map[event_type]
                        if item not in action_props
                    ]
            event_props_dict[action.name] = action_props

    return [
        Node(
            id=e,
            name=e,
            provider=datasource.provider,
            properties=event_props_dict.get(e, []),
        )
        for [e] in events
    ]


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
    ds_service: DataSourceService = Depends(),
):
    ds = await ds_service.get_datasource(ds_id)
    return await events_service.get_events(
        app_id=str(ds.app_id),
        datasource_id=ds_id,
        is_aux=is_aux,
        table_name=table_name,
        user_id=user_id,
        page_number=page_number,
        page_size=page_size,
    )


@router.put("/datasources/event/ingestion/{ds_id}")
async def event_ingestion(
    ds_id: str,
    dto: DiffEventIngestionDto,
    runlog_service: RunLogService = Depends(),
    dpq_service: DPQueueService = Depends(),
    event_property_service: EventPropertiesService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(ds_id)
    for event in dto.events:
        await event_property_service.create_event_properties(
            datasource_id=datasource.id,
            event_name=event,
            properties=[],
            provider=datasource.provider,
        )
    runlogs = await runlog_service.create_runlogs_with_events_and_dates(
        datasource.id, dto.start_date, dto.end_date, events=dto.events
    )
    jobs = dpq_service.enqueue_from_runlogs(runlogs)
    logging.info(f"Scheduled {len(jobs)} for data processing")
    return {"success": 200, "events": dto}


@router.get("/datasources/apps/{app_id}", response_model=List[DataSourceResponse])
async def get_datasources_by_app_id(
    app_id: str,
    ds_service: DataSourceService = Depends(),
):
    return await ds_service.get_datasources_for_app_id(PydanticObjectId(app_id))


@router.get("/datasources/{ds_id}/credentials", response_model=Credential)
async def get_credentials(
    ds_id: str,
    ds_service: DataSourceService = Depends(),
    integration_service: IntegrationService = Depends(),
):
    datasource = await ds_service.get_datasource(ds_id)
    integration = await integration_service.get_integration(datasource.integration_id)
    return integration.credential or {}


@router.put("/datasources/{ds_id}/credentials")
async def update_credentials(
    ds_id: str,
    dto: Credential,
    ds_service: DataSourceService = Depends(),
    integration_service: IntegrationService = Depends(),
):
    datasource = await ds_service.get_datasource(ds_id)
    await integration_service.update_credentials(datasource.integration_id, dto)

    return {"success": "ok"}


@router.delete("/datasources/{ds_id}")
async def delete_datasources(
    ds_id: str,
    ds_service: DataSourceService = Depends(),
):
    ds = await ds_service.get_datasource(id=ds_id)
    await ds_service.delete_datasource(PydanticObjectId(ds_id))
    await clear_cache(f"apperture-cache::get_connections:{ds.app_id}")
    return {"success": "ok"}
