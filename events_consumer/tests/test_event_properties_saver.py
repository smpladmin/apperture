from unittest.mock import MagicMock, call

from event_properties_saver import EventPropertiesSaver
from models.models import EventProperties


class TestEventPropertiesSaver:
    def setup_method(self):
        self.service = EventPropertiesSaver()
        self.service._save_data = MagicMock()
        self.precision_events = [
            {
                "event": "precise event",
                "properties": {
                    "$os": "Mac OS X",
                    "$browser": "Chrome",
                    "$device_type": "Desktop",
                    "token": "645036d8d659884e40f9caed",
                },
                "offset": 3874,
            },
            {
                "event": "precise event2",
                "properties": {
                    "$os": "Mac OS X",
                    "$browser": "Chrome",
                    "$device_type": "Desktop",
                    "token": "645036d8d659884e40f9caed",
                },
                "offset": 3196,
            },
        ]

    def test_save_precision_event_properties_empty_events_map(self):
        self.service.create_events_map = MagicMock()
        self.service.update_events_map = MagicMock(return_value=[])
        self.service.save_precision_event_properties(
            precision_events=self.precision_events
        )
        calls = [
            call(
                data={
                    "event": "precise event2",
                    "properties": ["$os", "$browser", "$device_type", "token"],
                    "provider": "apperture",
                },
                datasource_id="645036d8d659884e40f9caed",
            ),
            call(
                data={
                    "event": "precise event",
                    "properties": ["$os", "$browser", "$device_type", "token"],
                    "provider": "apperture",
                },
                datasource_id="645036d8d659884e40f9caed",
            ),
        ]
        self.service._save_data.assert_has_calls(calls=calls, any_order=True)
        self.service.create_events_map.assert_called_once_with(
            **{"event_properties": []}
        )

    def test_save_precision_event_properties_with_events_map(self):
        self.service.update_events_map = MagicMock(
            return_value=[
                {
                    "datasourceId": "645036d8d659884e40f9caed",
                    "event": "precise event",
                    "properties": [],
                    "provider": "apperture",
                }
            ]
        )
        self.service.create_events_map = MagicMock(
            return_value={"645036d8d659884e40f9caed": {"precise event": []}}
        )
        self.service.save_precision_event_properties(
            precision_events=self.precision_events
        )
        calls = [
            call(
                data={
                    "event": "precise event2",
                    "properties": ["$os", "$browser", "$device_type", "token"],
                    "provider": "apperture",
                },
                datasource_id="645036d8d659884e40f9caed",
            ),
            call(
                data={
                    "event": "precise event",
                    "properties": ["$os", "$browser", "$device_type", "token"],
                    "provider": "apperture",
                },
                datasource_id="645036d8d659884e40f9caed",
            ),
        ]
        self.service._save_data.assert_has_calls(calls=calls, any_order=True)
        self.service.create_events_map.assert_called_once_with(
            **{
                "event_properties": [
                    EventProperties(
                        datasourceId="645036d8d659884e40f9caed",
                        event="precise event",
                        properties=[],
                        provider="apperture",
                    )
                ]
            }
        )

    def test_save_precision_event_properties_with_events_map_and_properties(self):
        self.service.create_events_map = MagicMock()
        self.service.events_map = {
            "645036d8d659884e40f9caed": {
                "precise event": ["$os", "$browser", "$device_type", "token"]
            }
        }
        self.service.update_events_map = MagicMock(
            return_value=[
                {
                    "datasourceId": "645036d8d659884e40f9caed",
                    "event": "precise event",
                    "properties": [
                        {"name": "$os"},
                        {"name": "$browser"},
                        {"name": "$device_type"},
                        {"name": "token"},
                    ],
                    "provider": "apperture",
                }
            ]
        )
        self.service.save_precision_event_properties(
            precision_events=self.precision_events
        )
        calls = [
            call(
                data={
                    "event": "precise event2",
                    "properties": ["$os", "$browser", "$device_type", "token"],
                    "provider": "apperture",
                },
                datasource_id="645036d8d659884e40f9caed",
            ),
        ]
        self.service._save_data.assert_has_calls(calls=calls, any_order=True)
        self.service.create_events_map.assert_called_once_with(
            **{
                "event_properties": [
                    EventProperties(
                        datasourceId="645036d8d659884e40f9caed",
                        event="precise event",
                        properties=[
                            {"name": "$os"},
                            {"name": "$browser"},
                            {"name": "$device_type"},
                            {"name": "token"},
                        ],
                        provider="apperture",
                    )
                ]
            }
        )

    def test_create_events_map(self):
        event_properties = [
            EventProperties(
                datasourceId="63ce4906f496f7b462ab7e94",
                event="test",
                properties=[
                    {"name": "prop1", "type": "default"},
                    {"name": "prop4", "type": "default"},
                    {"name": "prop3", "type": "default"},
                ],
                provider="apperture",
            ),
            EventProperties(
                datasourceId="63ce4906f496f7b462ab7e84",
                event="test",
                properties=[
                    {"name": "prop1", "type": "string"},
                    {"name": "prop4", "type": "string"},
                    {"name": "prop3", "type": "string"},
                ],
                provider="apperture",
            ),
            EventProperties(
                datasourceId="63ce4906f496f7b462ab7e94",
                event="test2",
                properties=[
                    {"name": "prop1", "type": "string"},
                    {"name": "prop4", "type": "string"},
                    {"name": "prop3", "type": "string"},
                ],
                provider="apperture",
            ),
        ]
        assert self.service.create_events_map(event_properties=event_properties) == {
            "63ce4906f496f7b462ab7e84": {"test": ["prop1", "prop4", "prop3"]},
            "63ce4906f496f7b462ab7e94": {
                "test": ["prop1", "prop4", "prop3"],
                "test2": ["prop1", "prop4", "prop3"],
            },
        }
