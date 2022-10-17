import asyncio
import logging
from typing import List
from fastapi import APIRouter, Depends
from data_processor_queue.service import DPQueueService
from domain.datasources.service import DataSourceService
from domain.edge.service import EdgeService
from domain.notifications.service import NotificationService
from domain.notifications.models import NotificationType
from domain.integrations.service import IntegrationService
from domain.runlogs.service import RunLogService
from rest.dtos.datasources import PrivateDataSourceResponse
from rest.dtos.runlogs import UpdateRunLogDto
from rest.dtos.edges import CreateEdgesDto
from rest.dtos.notifications import (
    ComputedNotificationResponse,
    TriggerNotificationsDto,
)

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
            **e.dict(),
        )
        for e in dto.edges
    ]
    await edge_service.update_edges(edges, dto.provider, datasource.id)
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
    datasources = await ds_service.get_all_datasources()
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
        notifications=updates, notification_type=NotificationType.UPDATE
    )

    node_data_for_alerts = await edge_service.get_node_data_for_notifications(
        notifications=alerts, notification_type=NotificationType.ALERT
    )

    computed_updates = notification_service.compute_updates(node_data_for_updates)
    computed_alerts = notification_service.compute_alerts(node_data_for_alerts)

    return computed_alerts + computed_updates
