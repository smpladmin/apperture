from unittest.mock import MagicMock, call

from event_properties_saver import EventPropertiesSaver


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
        self.service.update_events_map = MagicMock(return_value={})
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

    def test_save_precision_event_properties_with_events_map(self):
        self.service.update_events_map = MagicMock(
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

    def test_save_precision_event_properties_with_events_map_and_properties(self):
        self.service.events_map = {
            "645036d8d659884e40f9caed": {
                "precise event": ["$os", "$browser", "$device_type", "token"]
            }
        }
        self.service.update_events_map = MagicMock(
            return_value={
                "645036d8d659884e40f9caed": {
                    "precise event": ["$os", "$browser", "$device_type", "token"]
                }
            }
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
