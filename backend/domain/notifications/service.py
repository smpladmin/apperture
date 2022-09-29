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
        pctThresholdValues: List[float],
        absoluteThresholdActive: bool,
        absoluteThresholdValues: List[float],
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
