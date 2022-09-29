from fastapi import APIRouter, Depends
from domain.users.models import User
from domain.notifications.service import NotificationService
from rest.dtos.notifications import CreateNotificationDto

from rest.middlewares import validate_jwt, get_user

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
