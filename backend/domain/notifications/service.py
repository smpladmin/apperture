from datetime import datetime
from typing import List, Dict, Set

from beanie.operators import In
from beanie import PydanticObjectId
from fastapi import Depends
from domain.notifications.models import NotificationData

from domain.common.models import SavedItems, WatchlistItemType
from domain.notifications.models import (
    Notification,
    NotificationFrequency,
    NotificationType,
    ThresholdMap,
    NotificationChannel,
    ComputedNotification,
    NotificationThresholdType,
    NotificationMetric,
    NotificationVariant,
    NotificationResponse,
)
from domain.edge.models import AggregatedEdge, NotificationNodeData

from mongo.mongo import Mongo


class NotificationService:
    def __init__(self, mongo: Mongo = Depends()):
        self.mongo = mongo

    def build_notification(
        self,
        datasourceId: PydanticObjectId,
        appId: PydanticObjectId,
        name: str,
        userId: PydanticObjectId,
        notificationType: Set[NotificationType],
        metric: NotificationMetric,
        multiNode: bool,
        appertureManaged: bool,
        pctThresholdActive: bool,
        pctThresholdValues: ThresholdMap,
        absoluteThresholdActive: bool,
        absoluteThresholdValues: ThresholdMap,
        formula: str,
        variableMap: Dict,
        frequency: NotificationFrequency,
        preferredHourGMT: int,
        preferredChannels: List[NotificationChannel],
        notificationActive: bool,
        variant: NotificationVariant,
        reference: str,
    ):
        return Notification(
            datasource_id=datasourceId,
            app_id=appId,
            name=name,
            user_id=userId,
            notification_type=notificationType,
            metric=metric,
            multi_node=multiNode,
            apperture_managed=appertureManaged,
            pct_threshold_active=pctThresholdActive,
            pct_threshold_values=pctThresholdValues,
            absolute_threshold_active=absoluteThresholdActive,
            absolute_threshold_values=absoluteThresholdValues,
            formula=formula,
            variable_map=variableMap,
            frequency=frequency,
            preferred_hour_gmt=preferredHourGMT,
            preferred_channels=preferredChannels,
            notification_active=notificationActive,
            variant=variant,
            reference=reference,
        )

    async def add_notification(self, notification: Notification):
        notification.updated_at = notification.created_at
        async with await self.mongo.client.start_session() as s:
            async with s.start_transaction():
                await Notification.insert(notification)

    async def get_notifications(self) -> List[Notification]:
        return await Notification.find(
            Notification.notification_active == True,
            Notification.enabled != False,
        ).to_list()

    async def get_notifications_to_compute(self, user_id: str) -> List[Notification]:
        return await Notification.find(
            Notification.user_id == PydanticObjectId(user_id),
            Notification.notification_active == True,
            Notification.enabled != False,
        ).to_list()

    def calculate_percentage_difference(self, value: float, prev_value: float):
        return (value - prev_value) * 100 / prev_value if prev_value != 0 else 0

    def alert_criteria(self, data: NotificationData, value: float):
        if data.threshold_type == NotificationThresholdType.ABSOLUTE:
            if (value > data.threshold_value.max) or (value < data.threshold_value.min):
                return True
        if data.threshold_type == NotificationThresholdType.PCT:
            prev_value = data.prev_day_value
            pct_change = self.calculate_percentage_difference(
                value=value, prev_value=prev_value
            )
            if (pct_change > data.threshold_value.max) or (
                pct_change < data.threshold_value.min
            ):
                return True
        return False

    def compute_value(self, node_data: List[List[AggregatedEdge]]):

        if len(node_data) == 1:
            val = (
                sum([node.hits for node in node_data[0]])
                if len(node_data[0]) > 0
                else 0
            )

        elif len(node_data) == 2:
            num = (
                sum([node.hits for node in node_data[0]])
                if len(node_data[0]) > 0
                else 0
            )
            den = (
                sum([node.hits for node in node_data[1]])
                if len(node_data[1]) > 0
                else 0
            )
            val = num / den if den != 0 else 0

        else:
            val = 0

        return val

    def compute_notification_values(
        self, data: NotificationData, notification_type: Set[NotificationType]
    ):
        trigger = False
        val = data.value

        if NotificationType.ALERT in notification_type:
            trigger = self.alert_criteria(data, val)

        return val, trigger

    def compute_update(
        self,
        data: NotificationData,
    ) -> List[ComputedNotification]:

        value = data.value
        prev_value = data.prev_day_value

        percentage_difference = self.calculate_percentage_difference(
            value=value, prev_value=prev_value
        )

        computed_updates = ComputedNotification(
            name=data.name,
            notification_id=data.notification_id,
            notification_type=NotificationType.UPDATE,
            variant=data.variant,
            value=float("{:.2f}".format(percentage_difference)),
            original_value=float("{:.2f}".format(data.value)),
            reference=data.reference,
        )

        return computed_updates

    def compute_updates(
        self,
        data_for_updates: List[NotificationData],
    ) -> List[ComputedNotification]:
        return [self.compute_update(data) for data in data_for_updates]

    def compute_alert(self, data: NotificationData):
        value, trigger = self.compute_notification_values(
            data=data, notification_type={NotificationType.ALERT}
        )

        computed_alert = ComputedNotification(
            name=data.name,
            notification_id=data.notification_id,
            notification_type=NotificationType.ALERT,
            variant=data.variant,
            value=float("{:.2f}".format(value)),
            original_value=float("{:.2f}".format(data.value)),
            reference=data.reference,
            threshold_type=data.threshold_type,
            user_threshold=data.threshold_value,
            trigger=trigger,
        )
        return computed_alert

    def compute_alerts(
        self,
        data_for_alerts: List[NotificationData],
    ) -> List[ComputedNotification]:
        return [self.compute_alert(data) for data in data_for_alerts]

    async def get_notification_for_node(
        self, name: str, datasource_id: str
    ) -> Notification:
        return await Notification.find_one(
            Notification.name == name,
            Notification.datasource_id == PydanticObjectId(datasource_id),
            Notification.notification_active == True,
        )

    async def update_notification(
        self, notification_id: str, new_notification: Notification
    ):
        to_update = new_notification.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()

        await Notification.find_one(
            Notification.id == PydanticObjectId(notification_id),
        ).update({"$set": to_update})

        return

    async def get_notifications_for_apps(
        self, app_ids: List[PydanticObjectId]
    ) -> List[SavedItems]:

        notifications = await Notification.find(
            In(Notification.app_id, app_ids),
            Notification.enabled != False,
        ).to_list()
        return [
            SavedItems(type=WatchlistItemType.NOTIFICATIONS, details=notification)
            for notification in notifications
        ]

    async def get_notifications_for_datasource_id(
        self, datasource_id: str
    ) -> List[NotificationResponse]:
        return await Notification.find(
            PydanticObjectId(datasource_id) == Notification.datasource_id,
            Notification.enabled != False,
        ).to_list()

    async def get_notification_by_reference(
        self, reference: str, datasource_id: str
    ) -> NotificationResponse:
        return await Notification.find_one(
            Notification.reference == reference,
            Notification.datasource_id == PydanticObjectId(datasource_id),
            Notification.enabled != False,
        )

    async def delete_notification(self, notification_id: str):
        await Notification.find_one(
            Notification.id == PydanticObjectId(notification_id),
        ).update({"$set": {"enabled": False}})
        return

    async def fetch_and_delete_notification(
        self, reference_id: str, datasource_id: str
    ):
        notification = await self.get_notification_by_reference(
            reference=reference_id, datasource_id=datasource_id
        )

        if notification:
            await self.delete_notification(notification_id=str(notification.id))
