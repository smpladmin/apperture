from typing import List, Dict
from beanie import PydanticObjectId
from fastapi import Depends
from mongo.mongo import Mongo

from domain.notifications.models import Notification


class NotificationService:
    def __init__(self, mongo: Mongo = Depends()):
        self.mongo = mongo

    def build_notification(
        self,
        datasourceId: str,
        userId: PydanticObjectId,
        notificationType: str,
        appertureManaged: bool,
        pctThresholdActive: bool,
        pctThresholdValues: Dict,
        absoluteThresholdActive: bool,
        absoluteThresholdValues: Dict,
        formula: str,
        variableMap: Dict,
        frequency: str,
        preferredHourGMT: int,
        preferredChannels: List[str],
        notificationActive: bool,
    ):
        return Notification(
            datasource_id=PydanticObjectId(datasourceId),
            user_id=userId,
            notification_type=notificationType,
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
        self, notification_type: str, frequency: str
    ) -> list[Notification]:
        pipeline = [
            {
                "$match": {
                    "frequency": frequency,
                    "notification_type": notification_type,
                    "notification_active": True,
                }
            }
        ]
        return await Notification.find().aggregate(pipeline).to_list()

    async def get_notifications_to_compute(self, user_id: str):
        pipeline = [
            {
                "$match": {
                    "user_id": PydanticObjectId(user_id),
                    "notification_active": True,
                }
            }
        ]
        return await (Notification.find().aggregate(pipeline).to_list())

    def compute_updates(
        self,
        node_data_bulk: Dict,
    ) -> List[Dict]:
        computed_updates = []

        if node_data_bulk:
            for notification_id, node_data in node_data_bulk.items():
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

                computed_update = {}
                computed_update["name"] = str(notification_id)
                computed_update["value"] = float("{:.2f}".format(val))
                computed_updates.append(computed_update)

        return computed_updates
