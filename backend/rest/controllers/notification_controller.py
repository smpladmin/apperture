from fastapi import APIRouter, Depends

from domain.users.models import User
from domain.notifications.models import NotificationResponse
from domain.notifications.service import NotificationService

from rest.middlewares import validate_jwt, get_user
from rest.dtos.notifications import CreateNotificationDto

router = APIRouter(
    tags=["notification"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/notifications", response_model=NotificationResponse)
async def add_notification(
    dto: CreateNotificationDto,
    user: User = Depends(get_user),
    notification_service: NotificationService = Depends(),
):
    notification = notification_service.build_notification(
        dto.datasourceId,
        dto.name,
        user.id,
        dto.notificationType,
        dto.metric,
        dto.multiNode,
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


@router.get("/notifications", response_model=NotificationResponse)
async def get_notification(
    name: str,
    notification_service: NotificationService = Depends(),
):
    return await notification_service.get_notification_for_node(name)


@router.put("/notifications/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: str,
    dto: CreateNotificationDto,
    user: User = Depends(get_user),
    notification_service: NotificationService = Depends(),
):
    new_notification = notification_service.build_notification(
        dto.datasourceId,
        dto.name,
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
    notification = await notification_service.update_notification(
        notification_id, new_notification
    )
    return notification
