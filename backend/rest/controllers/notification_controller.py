from typing import List, Union

from fastapi import APIRouter, Depends

from domain.apperture_users.models import AppertureUser
from domain.apps.service import AppService
from domain.datasources.service import DataSourceService
from domain.notifications.models import NotificationResponse
from domain.notifications.service import NotificationService
from rest.dtos.apperture_users import AppertureUserResponse as apperture_users
from rest.dtos.notifications import CreateNotificationDto, NotificationWithUser
from rest.middlewares import get_user, validate_jwt

router = APIRouter(
    tags=["notification"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/notifications", response_model=NotificationResponse)
async def add_notification(
    dto: CreateNotificationDto,
    user: AppertureUser = Depends(get_user),
    notification_service: NotificationService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    notification = notification_service.build_notification(
        datasourceId=datasource.id,
        appId=datasource.app_id,
        name=dto.name,
        userId=user.id,
        notificationType=dto.notificationType,
        metric=dto.metric,
        multiNode=dto.multiNode,
        appertureManaged=dto.appertureManaged,
        pctThresholdActive=dto.pctThresholdActive,
        pctThresholdValues=dto.pctThresholdValues,
        absoluteThresholdActive=dto.absoluteThresholdActive,
        absoluteThresholdValues=dto.absoluteThresholdValues,
        formula=dto.formula,
        variableMap=dto.variableMap,
        frequency=dto.frequency,
        preferredHourGMT=dto.preferredHourGMT,
        preferredChannels=dto.preferredChannels,
        notificationActive=dto.notificationActive,
        variant=dto.variant,
        reference=dto.reference,
    )
    await notification_service.add_notification(notification=notification)
    return notification


@router.get(
    "/notifications",
    response_model=Union[NotificationResponse, List[NotificationWithUser]],
)
async def get_notification(
    reference: Union[str, None] = None,
    datasource_id: Union[str, None] = None,
    user: AppertureUser = Depends(get_user),
    notification_service: NotificationService = Depends(),
):
    if reference:
        return await notification_service.get_notification_by_reference(
            reference=reference, datasource_id=datasource_id
        )
    else:
        notifications = await notification_service.get_notifications_for_datasource_id(
            datasource_id=datasource_id
        )
        notifications = [NotificationWithUser.from_orm(f) for f in notifications]
        for notification in notifications:
            notification.user = apperture_users.from_orm(user)
        return notifications


@router.put("/notifications/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: str,
    dto: CreateNotificationDto,
    user: AppertureUser = Depends(get_user),
    notification_service: NotificationService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dto.datasourceId)
    new_notification = notification_service.build_notification(
        datasourceId=datasource.id,
        appId=datasource.app_id,
        name=dto.name,
        userId=user.id,
        metric=dto.metric,
        multiNode=dto.multiNode,
        notificationType=dto.notificationType,
        appertureManaged=dto.appertureManaged,
        pctThresholdActive=dto.pctThresholdActive,
        pctThresholdValues=dto.pctThresholdValues,
        absoluteThresholdActive=dto.absoluteThresholdActive,
        absoluteThresholdValues=dto.absoluteThresholdValues,
        formula=dto.formula,
        variableMap=dto.variableMap,
        frequency=dto.frequency,
        preferredHourGMT=dto.preferredHourGMT,
        preferredChannels=dto.preferredChannels,
        notificationActive=dto.notificationActive,
        variant=dto.variant,
        reference=dto.reference,
    )
    await notification_service.update_notification(
        notification_id=notification_id, new_notification=new_notification
    )
    return new_notification


@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    notification_service: NotificationService = Depends(),
):
    await notification_service.delete_notification(notification_id=notification_id)
