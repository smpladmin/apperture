from typing import List, Dict

from beanie import PydanticObjectId
from fastapi import Depends

from domain.notifications.models import (
    Notification,
    NotificationFrequency,
    NotificationType,
    ThresholdMap,
    NotificationChannel,
    ComputedUpdate,
    NotificationMetric,
)
from domain.edge.models import NodeDataUpdate

from mongo.mongo import Mongo


class NotificationService:
    def __init__(self, mongo: Mongo = Depends()):
        self.mongo = mongo

    def build_notification(
        self,
        datasourceId: str,
        name: str,
        userId: PydanticObjectId,
        notificationType: NotificationType,
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
    ):
        return Notification(
            datasource_id=PydanticObjectId(datasourceId),
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
        )

    async def add_notification(self, notification: Notification):
        notification.updated_at = notification.created_at
        async with await self.mongo.client.start_session() as s:
            async with s.start_transaction():
                await Notification.insert(notification)

    async def get_notifications(
        self, notification_type: NotificationType, frequency: NotificationFrequency
    ) -> list[Notification]:
        return await Notification.find(
            Notification.frequency == frequency,
            Notification.notification_type == notification_type,
            Notification.notification_active == True,
        ).to_list()

    async def get_notifications_to_compute(self, user_id: str):
        return await Notification.find(
            Notification.user_id == PydanticObjectId(user_id),
            Notification.notification_active == True,
        ).to_list()

    def compute_update_values(self, data):
        if len(data.node_data) == 1:
            val = (
                sum([node.hits for node in data.node_data[0]])
                if len(data.node_data[0]) > 0
                else 0
            )

        elif len(data.node_data) == 2:
            num = (
                sum([node.hits for node in data.node_data[0]])
                if len(data.node_data[0]) > 0
                else 0
            )
            den = (
                sum([node.hits for node in data.node_data[1]])
                if len(data.node_data[1]) > 0
                else 0
            )
            val = num / den if den != 0 else 0

        else:
            val = 0

        return val

    def compute_updates(
        self,
        node_data_for_updates: List[NodeDataUpdate],
    ) -> List[ComputedUpdate]:

        computed_updates = (
            [
                ComputedUpdate(
                    name=data.name,
                    notification_id=data.update_id,
                    value=float("{:.2f}".format(self.compute_update_values(data))),
                )
                for data in node_data_for_updates
            ]
            if node_data_for_updates
            else []
        )

        return computed_updates
