import pytest
from beanie import PydanticObjectId

from domain.notifications.service import NotificationService
from domain.edge.models import NotificationNodeData, AggregatedEdge
from domain.notifications.models import (
    ThresholdMap,
    ComputedNotification,
    NotificationType,
    NotificationThresholdType,
)


class TestNotificationService:
    def setup_method(self):
        self.notification_service = NotificationService()
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
        self.computed_updates = [
            ComputedNotification(
                name="update1",
                notification_id=PydanticObjectId("633fb91c01ce2d17cae2142d"),
                notification_type=NotificationType.UPDATE,
                value=3.8,
                threshold_type=None,
                user_threshold=None,
                triggered=None,
            ),
            ComputedNotification(
                name="update2",
                notification_id=PydanticObjectId("633fb92a01ce2d17cae2142e"),
                notification_type=NotificationType.UPDATE,
                value=5.0,
                threshold_type=None,
                user_threshold=None,
                triggered=None,
            ),
        ]
        self.computed_alert = ComputedNotification(
            name="test",
            notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
            notification_type=NotificationType.ALERT,
            value=1.36,
            threshold_type=NotificationThresholdType.PCT,
            user_threshold=ThresholdMap(min=0.15, max=0.15),
            triggered=True,
        )

    def test_alert_criteria(self):
        assert self.notification_service.alert_criteria(
            data=self.notification_node_data, value=self.value
        )

    def test_compute_value(self):
        assert (
            self.notification_service.compute_value(
                node_data=self.notification_node_data.node_data
            )
            == 1.3571428571428572
        )

    def test_compute_updates(self):
        assert (
            self.notification_service.compute_updates(
                node_data_for_updates=self.node_data_for_updates
            )
            == self.computed_updates
        )

    def test_compute_alert(self):
        assert (
            self.notification_service.compute_alert(data=self.notification_node_data)
            == self.computed_alert
        )
