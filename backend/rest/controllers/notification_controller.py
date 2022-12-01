from typing import Union, List

from fastapi import APIRouter, Depends

from domain.users.models import User
from domain.apps.service import AppService
from domain.notifications.models import NotificationResponse
from domain.notifications.service import NotificationService
from domain.datasources.service import DataSourceService

from rest.middlewares import validate_jwt, get_user
from rest.dtos.saved_items import SavedItemsResponse
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
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    notification = notification_service.build_notification(
        datasource.id,
        datasource.app_id,
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


@router.get("/notifications", response_model=Union[List[NotificationResponse], List[SavedItemsResponse]])
async def get_notification(
    name: Union[str, None] = None,
    ds_id: Union[str, None] = None,
    user: User = Depends(get_user),
    app_service: AppService = Depends(),
    notification_service: NotificationService = Depends(),
):
    if name:
        return await notification_service.get_notification_for_node(name=name, ds_id=ds_id)
    else:
        apps = await app_service.get_apps(user=user)
        return await notification_service.get_notifications_for_apps(app_ids=[app.id for app in apps])


@router.put("/notifications/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: str,
    dto: CreateNotificationDto,
    user: User = Depends(get_user),
    notification_service: NotificationService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    new_notification = notification_service.build_notification(
        datasource.id,
        datasource.app_id,
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
