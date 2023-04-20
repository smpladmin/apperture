import asyncio
import logging
from typing import List, Union

from fastapi import APIRouter, Depends

from authorisation.service import AuthService
from data_processor_queue.service import DPQueueService
from domain.actions.service import ActionService
from domain.apperture_users.service import AppertureUserService
from domain.common.models import IntegrationProvider
from domain.datasources.service import DataSourceService
from domain.edge.service import EdgeService
from domain.events.service import EventsService
from domain.funnels.service import FunnelsService
from domain.integrations.service import IntegrationService
from domain.metrics.service import MetricService
from domain.notifications.models import NotificationType
from domain.notifications.service import NotificationService
from domain.properties.service import PropertiesService
from domain.runlogs.service import RunLogService
from rest.dtos.apperture_users import (
    CreateUserDto,
    PrivateUserResponse,
    ResetPasswordDto,
)
from rest.dtos.datasources import PrivateDataSourceResponse
from rest.dtos.edges import CreateEdgesDto
from rest.dtos.events import CreateEventDto
from rest.dtos.funnels import FunnelResponse, FunnelTrendResponse, TransientFunnelDto
from rest.dtos.metrics import (
    ComputedMetricStepResponse,
    MetricsComputeDto,
    SavedMetricResponse,
)
from rest.dtos.notifications import (
    ComputedNotificationResponse,
    TriggerNotificationsDto,
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


@router.post("/register")
async def register(
    dto: CreateUserDto,
    user_service: AppertureUserService = Depends(),
    auth_service: AuthService = Depends(),
):
    hash = auth_service.hash_password(dto.password)
    return await user_service.create_user_with_password(
        dto.first_name, dto.last_name, dto.email, hash
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


@router.post("/events")
async def update_events(
    dto: List[CreateEventDto],
    events_service: EventsService = Depends(),
):
    await events_service.update_events(dto)
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
async def get_notifications(
    dto: TriggerNotificationsDto,
    notification_service: NotificationService = Depends(),
    dpq_service: DPQueueService = Depends(),
):
    notifications = await notification_service.get_notifications(
        dto.notification_type, dto.frequency
    )
    user_ids = set([str(n.user_id) for n in notifications])
    jobs = [dpq_service.enqueue_user_notification(user_id) for user_id in user_ids]
    jobs = [{"user_id": user_id, "job": job} for user_id, job in zip(user_ids, jobs)]
    logging.info("Scheduled notification jobs")
    logging.info(jobs)
    return jobs


@router.get(
    "/notifications",
    response_model=List[ComputedNotificationResponse],
)
async def compute_notifications(
    user_id: str,
    compute: bool = True,
    notification_service: NotificationService = Depends(),
    edge_service: EdgeService = Depends(),
):
    notifications = await notification_service.get_notifications_to_compute(
        user_id=user_id
    )
    updates = [
        notif
        for notif in notifications
        if notif.notification_type.value == NotificationType.UPDATE
    ]

    alerts = [
        notif
        for notif in notifications
        if notif.notification_type.value == NotificationType.ALERT
    ]

    node_data_for_updates = await edge_service.get_node_data_for_notifications(
        notifications=updates
    )

    node_data_for_alerts = await edge_service.get_node_data_for_notifications(
        notifications=alerts
    )

    computed_updates = notification_service.compute_updates(node_data_for_updates)
    computed_alerts = notification_service.compute_alerts(node_data_for_alerts)

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
    )
