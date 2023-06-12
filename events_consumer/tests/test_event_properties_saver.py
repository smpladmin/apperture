from unittest.mock import MagicMock, call

from event_properties_saver import EventPropertiesSaver
from models.models import EventProperties, ClickStreamEventProperties


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
        self.cs_events = [
            {
                "event": "$autocapture",
                "properties": {
                    "$os": "Mac OS X",
                    "$browser": "Chrome",
                    "$device_type": "Desktop",
                    "token": "645036d8d659884e40f9caed",
                },
                "offset": 3874,
            },
            {
                "event": "$autocapture",
                "properties": {
                    "$os1": "Mac OS X",
                    "$browser1": "Chrome",
                    "$device_type": "Desktop",
                    "token": "645036d8d659884e40f9caed",
                },
                "offset": 3874,
            },
            {
                "event": "$pageview",
                "properties": {
                    "$os": "Mac OS X",
                    "$browser": "Chrome",
                    "$device_type": "Desktop",
                    "token": "645036d8d659884e40f9caed",
                },
                "offset": 3196,
            },
            {
                "event": "$pageleave",
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
        self.service.create_precise_events_map = MagicMock()
        self.service.update_events_map = MagicMock(return_value=[])
        self.service.save_precision_event_properties(
            precision_events=self.precision_events
        )
        calls = [
            call(
                data={
                    "datasource_id": "645036d8d659884e40f9caed",
                    "event": "precise event2",
                    "properties": ["$os", "$browser", "$device_type", "token"],
                    "provider": "apperture",
                },
                path="/private/event_properties",
            ),
            call(
                data={
                    "datasource_id": "645036d8d659884e40f9caed",
                    "event": "precise event",
                    "properties": ["$os", "$browser", "$device_type", "token"],
                    "provider": "apperture",
                },
                path="/private/event_properties",
            ),
        ]
        self.service._save_data.assert_has_calls(calls=calls, any_order=True)
        self.service.create_precise_events_map.assert_called_once_with(
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
        self.service.create_precise_events_map = MagicMock(
            return_value={"645036d8d659884e40f9caed": {"precise event": []}}
        )
        self.service.save_precision_event_properties(
            precision_events=self.precision_events
        )
        calls = [
            call(
                data={
                    "datasource_id": "645036d8d659884e40f9caed",
                    "event": "precise event2",
                    "properties": ["$os", "$browser", "$device_type", "token"],
                    "provider": "apperture",
                },
                path="/private/event_properties",
            ),
            call(
                data={
                    "datasource_id": "645036d8d659884e40f9caed",
                    "event": "precise event",
                    "properties": ["$os", "$browser", "$device_type", "token"],
                    "provider": "apperture",
                },
                path="/private/event_properties",
            ),
        ]
        self.service._save_data.assert_has_calls(calls=calls, any_order=True)
        self.service.create_precise_events_map.assert_called_once_with(
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
        self.service.create_precise_events_map = MagicMock()
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
                    "datasource_id": "645036d8d659884e40f9caed",
                    "event": "precise event2",
                    "properties": ["$os", "$browser", "$device_type", "token"],
                    "provider": "apperture",
                },
                path="/private/event_properties",
            ),
        ]
        self.service._save_data.assert_has_calls(calls=calls, any_order=True)
        self.service.create_precise_events_map.assert_called_once_with(
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

    def test_create_precise_events_map(self):
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
        assert self.service.create_precise_events_map(
            event_properties=event_properties
        ) == {
            "63ce4906f496f7b462ab7e84": {"test": ["prop1", "prop4", "prop3"]},
            "63ce4906f496f7b462ab7e94": {
                "test": ["prop1", "prop4", "prop3"],
                "test2": ["prop1", "prop4", "prop3"],
            },
        }

    def test_save_cs_event_properties_empty_events_map(self):
        self.service.create_cs_events_map = MagicMock()
        self.service.update_events_map = MagicMock(return_value=[])
        self.service.save_cs_event_properties(events=self.cs_events)
        calls = [
            call(
                path="/private/clickstream_event_properties",
                data={
                    "event": "$autocapture",
                    "properties": [
                        "$browser",
                        "$browser1",
                        "$device_type",
                        "$os",
                        "$os1",
                        "token",
                    ],
                },
            ),
            call(
                path="/private/clickstream_event_properties",
                data={
                    "event": "$pageview",
                    "properties": ["$browser", "$device_type", "$os", "token"],
                },
            ),
        ]
        self.service._save_data.assert_has_calls(calls=calls, any_order=True)
        self.service.create_cs_events_map.assert_called_once_with(
            **{"event_properties": []}
        )

    def test_save_cs_event_properties_with_events_map(self):
        self.service.update_events_map = MagicMock(
            return_value=[
                {
                    "event": "$autocapture",
                    "properties": [],
                },
                {
                    "event": "$pageview",
                    "properties": [],
                },
            ]
        )
        self.service.create_cs_events_map = MagicMock(
            return_value={"$autocapture": [], "$pageview": []}
        )
        self.service.save_cs_event_properties(events=self.cs_events)
        calls = [
            call(
                path="/private/clickstream_event_properties",
                data={
                    "event": "$autocapture",
                    "properties": [
                        "$browser",
                        "$browser1",
                        "$device_type",
                        "$os",
                        "$os1",
                        "token",
                    ],
                },
            ),
            call(
                path="/private/clickstream_event_properties",
                data={
                    "event": "$pageview",
                    "properties": ["$browser", "$device_type", "$os", "token"],
                },
            ),
        ]
        self.service._save_data.assert_has_calls(calls=calls, any_order=True)
        self.service.create_cs_events_map.assert_called_once_with(
            **{
                "event_properties": [
                    ClickStreamEventProperties(
                        event="$autocapture",
                        properties=[],
                    ),
                    ClickStreamEventProperties(
                        event="$pageview",
                        properties=[],
                    ),
                ]
            }
        )

    def test_save_cs_event_properties_with_events_map_and_properties(self):
        self.service.create_cs_events_map = MagicMock()
        self.service.cs_events_map = {
            "$autocapture": ["$os", "$browser", "$device_type", "token"],
            "$pageview": ["$os", "$browser", "$device_type", "token"],
        }
        self.service.update_events_map = MagicMock(
            return_value=[
                {
                    "event": "$autocapture",
                    "properties": [
                        {"name": "$os"},
                        {"name": "$browser"},
                        {"name": "$device_type"},
                        {"name": "token"},
                    ],
                },
                {
                    "event": "$pageview",
                    "properties": [
                        {"name": "$os"},
                        {"name": "$browser"},
                        {"name": "$device_type"},
                        {"name": "token"},
                    ],
                },
            ]
        )
        self.service.save_cs_event_properties(events=self.cs_events)
        calls = [
            call(
                path="/private/clickstream_event_properties",
                data={
                    "event": "$autocapture",
                    "properties": [
                        "$browser",
                        "$browser1",
                        "$device_type",
                        "$os",
                        "$os1",
                        "token",
                    ],
                },
            ),
        ]
        self.service._save_data.assert_has_calls(calls=calls, any_order=True)
        self.service.create_cs_events_map.assert_called_once_with(
            **{
                "event_properties": [
                    ClickStreamEventProperties(
                        event="$autocapture",
                        properties=[
                            {"name": "$os"},
                            {"name": "$browser"},
                            {"name": "$device_type"},
                            {"name": "token"},
                        ],
                    ),
                    ClickStreamEventProperties(
                        event="$pageview",
                        properties=[
                            {"name": "$os"},
                            {"name": "$browser"},
                            {"name": "$device_type"},
                            {"name": "token"},
                        ],
                    ),
                ]
            }
        )

    def test_create_cs_events_map(self):
        event_properties = [
            ClickStreamEventProperties(
                event="$autocapture",
                properties=[
                    {"name": "prop1", "type": "default"},
                    {"name": "prop4", "type": "default"},
                    {"name": "prop3", "type": "default"},
                ],
            ),
            ClickStreamEventProperties(
                event="$pageview",
                properties=[
                    {"name": "prop1", "type": "string"},
                    {"name": "prop4", "type": "string"},
                    {"name": "prop3", "type": "string"},
                ],
            ),
        ]
        assert self.service.create_cs_events_map(event_properties=event_properties) == {
            "$autocapture": ["prop1", "prop4", "prop3"],
            "$pageview": ["prop1", "prop4", "prop3"],
        }

    def test_get_distinct_values(self):
        assert self.service.get_distinct_values([[1, 2, 3], [3, 4, 5], [4, 5, 6]]) == [
            1,
            2,
            3,
            4,
            5,
            6,
        ]
