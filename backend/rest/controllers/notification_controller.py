from typing import List
from fastapi import APIRouter, Depends

from domain.users.models import User
from domain.edge.service import EdgeService
from domain.notifications.service import NotificationService

from rest.middlewares import validate_jwt, get_user
from rest.dtos.notifications import CreateNotificationDto, ComputedNotificationResponse

router = APIRouter(
    tags=["datasource"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/notifications")
async def add_notification(
    dto: CreateNotificationDto,
    user: User = Depends(get_user),
    notification_service: NotificationService = Depends(),
):
    notification = notification_service.build_notification(
        dto.datasourceId,
        user.id,
        dto.notificationType,
        dto.appertureManaged,
        dto.pctThresholdActive,
        dto.pctThresholdValues,
        dto.absoluteThresholdActive,
        dto.absoluteThresholdValues,
        dto.formula,
        dto.variableMap,
        dto.frequency,
        dto.preferredHourGMT,
        dto.preferredChannels,
        dto.notificationActive,
    )
    await notification_service.add_notification(notification)
    return notification


@router.get(
    "/compute_notifications/{user_id}",
    response_model=List[ComputedNotificationResponse],
)
async def compute_notifications(
    user_id: str,
    notification_service: NotificationService = Depends(),
    edge_service: EdgeService = Depends(),
):
    notifications = await notification_service.get_notifications_to_compute(
        user_id=user_id
    )
    updates = [
        notif for notif in notifications if notif["notification_type"] == "update"
    ]
    alerts = [notif for notif in notifications if notif["notification_type"] == "alert"]

    node_data_bulk = await edge_service.get_node_data_bulk(updates=updates)
    computed_updates = notification_service.compute_updates(node_data_bulk)

    return computed_updates
