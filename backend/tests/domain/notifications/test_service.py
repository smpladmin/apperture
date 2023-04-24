import asyncio
from collections import namedtuple

import pytest
from beanie import PydanticObjectId
from unittest.mock import MagicMock, AsyncMock, ANY

from domain.notifications.service import NotificationService
from domain.notifications.models import Notification, NotificationData
from domain.edge.models import NotificationNodeData, AggregatedEdge
from domain.notifications.models import (
    ThresholdMap,
    ComputedNotification,
    NotificationType,
    NotificationThresholdType,
    NotificationMetric,
    NotificationFrequency,
    NotificationChannel,
    NotificationVariant,
)


class TestNotificationService:
    def setup_method(self):
        self.value = 1.3571428571428572
        self.notification_node_data = NotificationNodeData(
            name="test",
            notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
            node_data=[
                [
                    AggregatedEdge(
                        previous_event="", current_event="/login", users=190, hits=190
                    )
                ],
                [
                    AggregatedEdge(
                        previous_event="", current_event="/", users=130, hits=140
                    )
                ],
            ],
            prev_day_node_data=[
                [
                    AggregatedEdge(
                        previous_event="", current_event="/login", users=150, hits=189
                    )
                ],
                [
                    AggregatedEdge(
                        previous_event="", current_event="/", users=164, hits=246
                    )
                ],
            ],
            threshold_type="pct",
            threshold_value=ThresholdMap(min=0.15, max=0.15),
        )
        self.node_data_for_updates = [
            NotificationNodeData(
                name="update1",
                notification_id=PydanticObjectId("633fb91c01ce2d17cae2142d"),
                node_data=[
                    [
                        AggregatedEdge(
                            previous_event="", current_event="/login", users=19, hits=19
                        )
                    ],
                    [
                        AggregatedEdge(
                            previous_event="",
                            current_event="/channelportal",
                            users=5,
                            hits=5,
                        )
                    ],
                ],
                prev_day_node_data=[
                    [
                        AggregatedEdge(
                            previous_event="",
                            current_event="/login",
                            users=150,
                            hits=189,
                        )
                    ],
                    [
                        AggregatedEdge(
                            previous_event="",
                            current_event="/channelportal",
                            users=1,
                            hits=1,
                        )
                    ],
                ],
                threshold_type="absolute",
                threshold_value=None,
            ),
            NotificationNodeData(
                name="update2",
                notification_id=PydanticObjectId("633fb92a01ce2d17cae2142e"),
                node_data=[
                    [
                        AggregatedEdge(
                            previous_event="", current_event="/p", users=25, hits=25
                        )
                    ],
                    [
                        AggregatedEdge(
                            previous_event="",
                            current_event="/channelportal",
                            users=5,
                            hits=5,
                        )
                    ],
                ],
                prev_day_node_data=[
                    [
                        AggregatedEdge(
                            previous_event="", current_event="/p", users=76, hits=79
                        )
                    ],
                    [
                        AggregatedEdge(
                            previous_event="",
                            current_event="/channelportal",
                            users=1,
                            hits=1,
                        )
                    ],
                ],
                threshold_type="absolute",
                threshold_value=None,
            ),
        ]

        self.notification_data_for_updates = [
            NotificationData(
                name="update1",
                notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
                variant=NotificationVariant.FUNNEL,
                value=0.10,
                prev_day_value=0.12,
                reference="639237437483490",
                threshold_type=NotificationThresholdType.PCT,
                threshold_value=ThresholdMap(min=0.15, max=0.25),
            ),
            NotificationData(
                name="update2",
                notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
                variant=NotificationVariant.FUNNEL,
                value=0.10,
                prev_day_value=0.12,
                reference="6777439823920337",
                threshold_type=NotificationThresholdType.ABSOLUTE,
                threshold_value=ThresholdMap(min=0.15, max=0.25),
            ),
        ]

        self.notification_data_with_threshold_percentage = NotificationData(
            name="test",
            notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
            variant=NotificationVariant.FUNNEL,
            value=0.10,
            prev_day_value=0.12,
            reference="639237437483490",
            threshold_type=NotificationThresholdType.PCT,
            threshold_value=ThresholdMap(min=0.15, max=0.25),
        )

        self.notification_data_with_threshold_absolute = NotificationData(
            name="test",
            notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
            variant=NotificationVariant.FUNNEL,
            value=0.10,
            prev_day_value=0.12,
            reference="639237437483490",
            threshold_type=NotificationThresholdType.ABSOLUTE,
            threshold_value=ThresholdMap(min=0.15, max=0.25),
        )

        self.computed_updates = [
            ComputedNotification(
                name="update1",
                notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
                notification_type=NotificationType.UPDATE,
                variant=NotificationVariant.FUNNEL,
                value=-16.67,
                original_value=0.1,
                reference="639237437483490",
                threshold_type=None,
                user_threshold=None,
                triggered=None,
            ),
            ComputedNotification(
                name="update2",
                notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
                notification_type=NotificationType.UPDATE,
                variant=NotificationVariant.FUNNEL,
                value=-16.67,
                original_value=0.1,
                reference="6777439823920337",
                threshold_type=None,
                user_threshold=None,
                triggered=None,
            ),
        ]

        self.computed_alert = ComputedNotification(
            name="test",
            notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
            notification_type=NotificationType.ALERT,
            variant=NotificationVariant.FUNNEL,
            value=0.1,
            original_value=0.1,
            reference="639237437483490",
            threshold_type=NotificationThresholdType.PCT,
            user_threshold=ThresholdMap(min=0.15, max=0.25),
            triggered=True,
        )
        self.name = "test"
        self.ds_id = "6384a66e0a397236d9de236c"
        self.id = PydanticObjectId("6384a66e0a397236d9de236c")
        Notification.get_settings = MagicMock()
        Notification.name = MagicMock(return_value=self.name)
        Notification.datasource_id = MagicMock(
            return_value=PydanticObjectId(self.ds_id)
        )
        Notification.app_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        Notification.notification_active = MagicMock(return_value=True)
        Notification.id = MagicMock(return_value=self.id)
        Notification.enabled = True
        self.notification = Notification(
            id=PydanticObjectId("6384a66e0a397236d9de236c"),
            datasource_id=PydanticObjectId("6384a66e0a397236d9de236c"),
            user_id=PydanticObjectId("636a0be89684fdc9a380dfd6"),
            app_id=PydanticObjectId("6384a65e0a397236d9de236a"),
            name="user_login",
            notification_type={NotificationType.ALERT},
            metric=NotificationMetric.HITS,
            multi_node=False,
            apperture_managed=False,
            pct_threshold_active=False,
            pct_threshold_values=None,
            absolute_threshold_active=True,
            absolute_threshold_values=ThresholdMap(min=1.0, max=16834.0),
            formula="a",
            variable_map={"a": ["user_login"]},
            preferred_hour_gmt=5,
            frequency=NotificationFrequency.DAILY,
            preferred_channels=[NotificationChannel.SLACK],
            notification_active=True,
            variant=NotificationVariant.NODE,
            reference="/p/partner/job",
        )
        notif_future = asyncio.Future()
        notif_future.update = AsyncMock()
        self.update_mock = notif_future.update
        notif_future.set_result(self.notification)
        self.mongo = MagicMock()
        self.service = NotificationService(mongo=self.mongo)
        Notification.find_one = MagicMock(return_value=notif_future)
        FindMock = namedtuple("FindMock", ["to_list"])
        Notification.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )

    def test_alert_criteria(self):
        assert (
            self.service.alert_criteria(
                data=self.notification_data_with_threshold_percentage, value=self.value
            )
            == True
        )

    def test_alert_criteria(self):
        assert (
            self.service.alert_criteria(
                data=self.notification_data_with_threshold_absolute, value=0.20
            )
            == False
        )

    def test_compute_value(self):
        assert (
            self.service.compute_value(node_data=self.notification_node_data.node_data)
            == 1.3571428571428572
        )

    def test_compute_updates(self):
        assert (
            self.service.compute_updates(
                data_for_updates=self.notification_data_for_updates
            )
            == self.computed_updates
        )

    def test_compute_alert(self):
        assert (
            self.service.compute_alert(
                data=self.notification_data_with_threshold_percentage
            )
            == self.computed_alert
        )

    @pytest.mark.asyncio
    async def test_get_notification_for_node(self):
        notif = await self.service.get_notification_for_node(
            name=self.name, datasource_id=self.ds_id
        )
        assert {
            "absolute_threshold_active": True,
            "absolute_threshold_values": {"max": 16834.0, "min": 1.0},
            "app_id": PydanticObjectId("6384a65e0a397236d9de236a"),
            "apperture_managed": False,
            "created_at": ANY,
            "datasource_id": PydanticObjectId("6384a66e0a397236d9de236c"),
            "formula": "a",
            "frequency": NotificationFrequency.DAILY,
            "id": PydanticObjectId("6384a66e0a397236d9de236c"),
            "metric": NotificationMetric.HITS,
            "multi_node": False,
            "name": "user_login",
            "notification_active": True,
            "notification_type": {NotificationType.ALERT},
            "pct_threshold_active": False,
            "pct_threshold_values": None,
            "preferred_channels": [NotificationChannel.SLACK],
            "preferred_hour_gmt": 5,
            "revision_id": ANY,
            "updated_at": None,
            "user_id": PydanticObjectId("636a0be89684fdc9a380dfd6"),
            "variable_map": {"a": ["user_login"]},
            "variant": NotificationVariant.NODE,
            "reference": "/p/partner/job",
            "enabled": True,
        } == notif.dict()

    @pytest.mark.asyncio
    async def test_get_notifications_for_apps(self):
        await self.service.get_notifications_for_apps(
            app_ids=[PydanticObjectId("6384a65e0a397236d9de236a")]
        )
        Notification.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_notifications_for_datasource_id(self):
        await self.service.get_notifications_for_datasource_id(
            datasource_id="6384a65e0a397236d9de236a"
        )
        Notification.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_notification(self):

        await self.service.delete_notification(
            notification_id="6384a65e0a397236d9de236a"
        )
        Notification.find_one.assert_called_once()
        self.update_mock.assert_called_once_with({"$set": {"enabled": False}})
