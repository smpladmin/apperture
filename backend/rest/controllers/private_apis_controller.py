import asyncio
import logging
from typing import List, Union

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends

from authorisation.service import AuthService
from data_processor_queue.service import DPQueueService
from domain.actions.service import ActionService
from domain.apidata.service import APIDataService
from domain.apperture_users.service import AppertureUserService
from domain.apps.service import AppService
from domain.clickstream_event_properties.service import (
    ClickStreamEventPropertiesService,
)
from domain.common.models import IntegrationProvider
from domain.datamart.service import DataMartService
from domain.datasources.service import DataSourceService
from domain.edge.service import EdgeService
from domain.event_properties.service import EventPropertiesService
from domain.events.service import EventsService
from domain.funnels.service import FunnelsService
from domain.integrations.service import IntegrationService
from domain.metrics.service import MetricService
from domain.notifications.models import NotificationType, NotificationVariant
from domain.notifications.service import NotificationService
from domain.properties.service import PropertiesService
from domain.runlogs.service import RunLogService
from rest.dtos.apidata import CreateAPIDataDto
from rest.dtos.apperture_users import PrivateUserResponse, ResetPasswordDto
from rest.dtos.clickstream_event_properties import (
    ClickStreamEventPropertiesDto,
    ClickStreamEventPropertiesResponse,
)
from rest.dtos.datamart import RefreshDataMartDto
from rest.dtos.datasources import PrivateDataSourceResponse
from rest.dtos.edges import CreateEdgesDto
from rest.dtos.event_properties import EventPropertiesDto, EventPropertiesResponse
from rest.dtos.events import CreateEventDto
from rest.dtos.funnels import FunnelResponse, FunnelTrendResponse, TransientFunnelDto
from rest.dtos.metrics import (
    ComputedMetricStepResponse,
    MetricsComputeDto,
    SavedMetricResponse,
)
from rest.dtos.properties import PropertiesResponse
from rest.dtos.runlogs import UpdateRunLogDto
from rest.middlewares import validate_api_key

router = APIRouter(
    tags=["private"],
    dependencies=[Depends(validate_api_key)],
    responses={401: {}},
    prefix="/private",
)


@router.post("/password/reset")
async def register(
    dto: ResetPasswordDto,
    user_service: AppertureUserService = Depends(),
    auth_service: AuthService = Depends(),
):
    hash = auth_service.hash_password(dto.password)
    return await user_service.reset_user_password(dto.email, hash)


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
            **e.dict(),
        )
        for e in dto.edges
    ]
    await edge_service.update_edges(edges, dto.provider, datasource.id)
    return {"updated": True}


@router.post("/apidata/{tableName}/{start_time}/{end_time}")
async def update_apidata(
    tableName: str,
    start_time: str,
    end_time: str,
    dto: List[CreateAPIDataDto],
    api_data_service: APIDataService = Depends(),
    app_service: AppService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    if not dto:
        return {"updated": False, "message": "No data to update."}
    ds_id = dto[0].datasource_id
    datasource = await ds_service.get_datasource(ds_id)
    app = await app_service.get_app(str(datasource.app_id))
    await api_data_service.update_api_data(
        dto, app.clickhouse_credential.databasename, tableName, start_time, end_time
    )
    return {"updated": True}


@router.post("/events")
async def update_events(
    dto: List[CreateEventDto],
    events_service: EventsService = Depends(),
):
    await events_service.update_events(dto)
    return {"updated": True}


@router.post("/event_properties")
async def update_event_properties(
    dto: EventPropertiesDto,
    event_properties_service: EventPropertiesService = Depends(),
):
    await event_properties_service.update_event_properties(event_properties=dto)
    return {"updated": True}


@router.put("/runlogs/{id}", responses={404: {}})
async def update_runlog(
    id: str,
    dto: UpdateRunLogDto,
    service: RunLogService = Depends(),
):
    runlog = await service.update_runlog(id, dto.status)
    return runlog


@router.post("/datasources")
async def trigger_fetch_for_all_datasources(
    ds_service: DataSourceService = Depends(),
    runlog_service: RunLogService = Depends(),
    dpq_service: DPQueueService = Depends(),
):
    datasources = await ds_service.get_non_apperture_datasources()
    runlog_promises = [runlog_service.create_pending_runlogs(ds) for ds in datasources]
    runlogs = await asyncio.gather(*runlog_promises)
    jobs = [
        {
            "datasource_id": ds.id,
            "runlogs": logs,
            "jobs": dpq_service.enqueue_for_provider(ds.provider, logs),
        }
        for logs, ds in zip(runlogs, datasources)
    ]
    logging.info("Scheduled jobs for all datasources")
    logging.info(jobs)
    return jobs


@router.post("/notifications")
async def post_notifications(
    notification_service: NotificationService = Depends(),
    dpq_service: DPQueueService = Depends(),
):
    notifications = await notification_service.get_notifications()
    user_ids = set([str(n.user_id) for n in notifications])
    jobs = [dpq_service.enqueue_user_notification(user_id) for user_id in user_ids]
    jobs = [{"user_id": user_id, "job": job} for user_id, job in zip(user_ids, jobs)]
    logging.info("Scheduled notification jobs")
    logging.info(jobs)
    return jobs


@router.get("/notifications")
async def compute_notifications(
    user_id: str,
    compute: bool = True,
    notification_service: NotificationService = Depends(),
    funnel_service: FunnelsService = Depends(),
    metric_service: MetricService = Depends(),
):
    notifications = await notification_service.get_notifications_to_compute(
        user_id=user_id
    )

    metric_updates = [
        notif
        for notif in notifications
        if NotificationType.UPDATE in notif.notification_type
        and notif.variant == NotificationVariant.METRIC
    ]

    metric_alerts = [
        notif
        for notif in notifications
        if NotificationType.ALERT in notif.notification_type
        and notif.variant == NotificationVariant.METRIC
    ]

    funnel_updates = [
        notif
        for notif in notifications
        if NotificationType.UPDATE in notif.notification_type
        and notif.variant == NotificationVariant.FUNNEL
    ]

    funnel_alerts = [
        notif
        for notif in notifications
        if NotificationType.ALERT in notif.notification_type
        and notif.variant == NotificationVariant.FUNNEL
    ]

    funnel_data_for_alerts = await funnel_service.get_funnel_data_for_notifications(
        notifications=funnel_alerts
    )
    funnel_data_for_updates = await funnel_service.get_funnel_data_for_notifications(
        notifications=funnel_updates
    )
    metric_data_for_alerts = await metric_service.get_metric_data_for_notifications(
        notifications=metric_alerts
    )
    metric_data_for_updates = await metric_service.get_metric_data_for_notifications(
        notifications=metric_updates
    )

    computed_alerts = notification_service.compute_alerts(
        funnel_data_for_alerts + metric_data_for_alerts
    )

    computed_updates = notification_service.compute_updates(
        funnel_data_for_updates + metric_data_for_updates
    )
    return computed_alerts + computed_updates


@router.get("/users/{user_id}", response_model=PrivateUserResponse)
async def slack_url(
    user_id: str,
    user_service: AppertureUserService = Depends(),
):
    return await user_service.get_user(user_id)


@router.put("/properties", response_model=PropertiesResponse)
async def refresh_properties(
    ds_id: Union[str, None] = None,
    properties_service: PropertiesService = Depends(),
):
    return (
        await properties_service.refresh_properties(ds_id=ds_id)
        if ds_id
        else await properties_service.refresh_properties_for_all_datasources()
    )


@router.post("/click_stream")
async def update_events_from_clickstream(
    datasource_id: Union[str, None] = None,
    action_service: ActionService = Depends(),
    datasource_service: DataSourceService = Depends(),
):
    if datasource_id:
        await action_service.update_events_from_clickstream(datasource_id=datasource_id)
        return {"updated": datasource_id}

    else:
        apperture_datasources = await datasource_service.get_datasources_for_provider(
            provider=IntegrationProvider.APPERTURE
        )
        for datasource in apperture_datasources:
            await action_service.update_events_from_clickstream(
                datasource_id=str(datasource.id)
            )
        return {"updated": [str(datasource.id) for datasource in apperture_datasources]}


@router.post("/runlogs")
async def create_pending_runlogs(
    ds_id: str,
    ds_service: DataSourceService = Depends(),
    runlog_service: RunLogService = Depends(),
    dpq_service: DPQueueService = Depends(),
):
    datasource = await ds_service.get_datasource(ds_id)
    if datasource.provider == IntegrationProvider.API:
        runlogs = await runlog_service.create_pending_api_runlogs(datasource.id)
    else:
        runlogs = await runlog_service.create_pending_runlogs(datasource)
    jobs = dpq_service.enqueue_from_runlogs(runlogs)
    return jobs


@router.get("/metrics/{id}", response_model=SavedMetricResponse)
async def get_metric_by_id(
    id: str,
    metric_service: MetricService = Depends(),
):
    return await metric_service.get_metric_by_id(metric_id=id)


@router.post("/metrics/compute", response_model=List[ComputedMetricStepResponse])
async def compute_metrics(
    dto: MetricsComputeDto,
    metric_service: MetricService = Depends(),
):
    if metric_service.validate_formula(
        dto.function, [aggregate.variable for aggregate in dto.aggregates]
    ):
        result = await metric_service.compute_metric(
            datasource_id=str(dto.datasourceId),
            function=dto.function,
            aggregates=dto.aggregates,
            breakdown=dto.breakdown,
            date_filter=dto.dateFilter,
            segment_filter=dto.segmentFilter,
        )
        return result
    return [
        ComputedMetricStepResponse(name=func, series=[])
        for func in dto.function.split(",")
    ]


@router.get("/funnels/{id}", response_model=FunnelResponse)
async def get_saved_funnel(
    id: str,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.get_funnel(id)


@router.post("/funnels/trends/transient", response_model=List[FunnelTrendResponse])
async def get_transient_funnel_trends(
    dto: TransientFunnelDto,
    funnel_service: FunnelsService = Depends(),
):
    return await funnel_service.get_funnel_trends(
        datasource_id=dto.datasourceId,
        steps=dto.steps,
        date_filter=dto.dateFilter,
        conversion_window=dto.conversionWindow,
        random_sequence=dto.randomSequence,
        segment_filter=dto.segmentFilter,
    )


@router.get("/event_properties", response_model=List[EventPropertiesResponse])
async def get_event_properties(
    event_properties_service: EventPropertiesService = Depends(),
):
    return await event_properties_service.get_event_properties()


@router.post("/clickstream_event_properties")
async def update_clickstream_event_properties(
    dto: ClickStreamEventPropertiesDto,
    clickstream_event_properties_service: ClickStreamEventPropertiesService = Depends(),
):
    await clickstream_event_properties_service.update_event_properties(
        event_properties=dto
    )
    return {"updated": True}


@router.get(
    "/clickstream_event_properties",
    response_model=List[ClickStreamEventPropertiesResponse],
)
async def get_clickstream_event_properties(
    clickstream_event_properties_service: ClickStreamEventPropertiesService = Depends(),
):
    return await clickstream_event_properties_service.get_event_properties()


@router.post("/datamart")
async def refresh_datamart_tables_for_app(
    dto: RefreshDataMartDto,
    app_service: AppService = Depends(),
    datamart_service: DataMartService = Depends(),
):
    res = {}
    app_id = dto.appId
    app = await app_service.get_app(id=app_id)
    datamart_tables = await datamart_service.get_datamart_tables_for_app_id(
        app_id=PydanticObjectId(app_id)
    )

    for table in datamart_tables:
        await datamart_service.refresh_datamart_table(
            datamart_id=str(table.id), clickhouse_credential=app.clickhouse_credential
        )
        res[str(table.id)] = "updated"
    return {app_id: res}


@router.post("/apps/datamart")
async def trigger_refresh_datamart_for_all_apps(
    datamart_service: DataMartService = Depends(),
    dpq_service: DPQueueService = Depends(),
):
    apps_with_datamart = await datamart_service.get_all_apps_with_datamarts()
    jobs = [
        {
            "app_id": app_id,
            "jobs": dpq_service.enqueue_refresh_datamart_for_app(app_id),
        }
        for app_id in apps_with_datamart
    ]
    logging.info("Scheduled jobs for all apps")
    logging.info(jobs)
    return jobs


@router.get("/integrations/{dsId}/events")
async def get_datasource_events(
    dsId: str,
    event_property_service: EventPropertiesService = Depends(),
):
    event_properties = await event_property_service.get_event_properties_for_datasource(
        datasource_id=dsId
    )

    return [properties.event for properties in event_properties]
