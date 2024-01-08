from collections import namedtuple
from unittest.mock import ANY, AsyncMock, MagicMock, patch

from beanie import PydanticObjectId
import pytest
from domain.alerts.service import AlertService
from domain.datasources.models import DataSource
from domain.alerts.models import (
    Alert,
    AlertType,
    SlackChannel,
    Threshold,
    ThresholdType,
)


class TestAlertService:
    def setup_method(self):
        Alert.get_settings = MagicMock()
        Alert.find_one = AsyncMock()
        Alert.update = AsyncMock()
        DataSource.get_settings = MagicMock()
        self.mongo = MagicMock()
        self.service = AlertService(
            mongo=self.mongo,
        )
        self.ds_id = "636a1c61d715ca6baae65611"

        FindMock = namedtuple("FindMock", ["to_list"])
        Alert.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )
        Alert.datasource_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        Alert.type = MagicMock(return_value=AlertType.CDC_ERROR)
        self.alert = Alert(
            datasource_id=self.ds_id,
            type=AlertType.CDC_ERROR,
            channel=SlackChannel(
                type="slack",
                slack_channel="https://hooks.slack.com/services/T0BV42/B06A09V",
                slack_url="alerts",
            ),
            schedule=None,
            enabled=True,
            threshold=Threshold(type=ThresholdType.ABSOLUTE, value=100),
        )

        FindOneMock = namedtuple("FindOneMock", ["update"])
        self.update_mock = AsyncMock()
        Alert.find_one = MagicMock(return_value=FindOneMock(update=self.update_mock))
        Alert.insert = AsyncMock()
        Alert.id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        Alert.enabled = True

    def test_build_alert_config(self):
        alert = self.service.build_alert_config(
            datasource_id=PydanticObjectId(self.ds_id),
            type=AlertType.CDC_ERROR,
            schedule=None,
            channel={
                "type": "slack",
                "slack_channel": "alerts",
                "slack_url": "https://hooks.slack.com/services/T0BV42/B06A09V",
            },
            threshold=Threshold(type=ThresholdType.ABSOLUTE, value=100),
        )

        assert alert.dict() == {
            "channel": {
                "slack_channel": "alerts",
                "slack_url": "https://hooks.slack.com/services/T0BV42/B06A09V",
                "type": "slack",
            },
            "created_at": ANY,
            "datasource_id": PydanticObjectId("636a1c61d715ca6baae65611"),
            "enabled": True,
            "id": None,
            "revision_id": None,
            "schedule": None,
            "table": None,
            "type": AlertType.CDC_ERROR,
            "updated_at": None,
            "frequency_alert": None,
            "threshold": {"type": ThresholdType.ABSOLUTE, "value": 100},
        }

    @pytest.mark.asyncio
    async def test_save_alert_config(self):
        alert = await self.service.save_alert_config(alert=self.alert)
        Alert.insert.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_alert_config(self):
        await self.service.update_alert_config(
            id=self.ds_id,
            alert=self.alert,
        )
        Alert.find_one.assert_called_once_with(
            False,
        )

    @pytest.mark.asyncio
    async def test_get_alerts(self):
        await self.service.get_alerts()
        Alert.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_alert_for_datasource_id_with_alert_type(self):
        Alert.find_one = AsyncMock()
        await self.service.get_alert_for_datasource_id_with_alert_type(
            datasource_id=self.ds_id, alert_type=AlertType.CDC_ERROR
        )
        Alert.find_one.assert_called_once()

    def test_get_integration_id_from_cdc_error_log_when_match_found(
        self,
    ):
        log = "ERROR SQL_Server|cdc_658c7bfb29fb997dfa517fcf|streaming Producer failure [io.debezium.pipeline.ErrorHandler]"
        expected_id = "658c7bfb29fb997dfa517fcf"

        result = self.service.get_intergation_id_from_cdc_error_log(log)
        assert result == expected_id

    def test_get_error_message_with_log_containing_error(self):
        log = "ERROR SQL_Server|cdc_658c7bfb29fb997dfa517fcf|streaming Producer failure [io.debezium.pipeline.ErrorHandler]"
        expected_message = "SQL_Server|cdc_658c7bfb29fb997dfa517fcf|streaming Producer failure [io.debezium.pipeline.ErrorHandler]"

        result = self.service.get_error_message(log)
        assert result == expected_message

    def test_post_message_to_slack_successfully_sent(self):
        slack_url = "https://your-slack-url"
        message = "This is a test message"
        alert_type = AlertType.CDC_ERROR

        with patch("requests.post") as mock_post:
            self.service.post_message_to_slack(slack_url, message, alert_type)
            mock_post.assert_called_once_with(
                slack_url,
                json={
                    "blocks": [
                        {
                            "type": "header",
                            "text": {
                                "type": "plain_text",
                                "text": f"Alert - {alert_type}:zap:",
                                "emoji": True,
                            },
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": message,
                            },
                        },
                    ],
                },
            )
