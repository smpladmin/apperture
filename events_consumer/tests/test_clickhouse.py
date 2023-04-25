from datetime import datetime
from unittest.mock import MagicMock
from clickhouse import ClickHouse
from models.models import ClickStream


class TestClickHouse:
    def setup_method(self):
        self.clickhouse = ClickHouse()
        self.clickhouse.client = MagicMock()
        pass

    def test_save_events(self):
        cs_events = [
            ClickStream(
                "test_ds_id",
                datetime(2021, 8, 10, 20, 20, 47, 370000),
                "test_user_id",
                "",
                "$pageview",
                {
                    "$browser": "Chrome",
                    "$browser_language": "en-GB",
                    "$browser_version": 109,
                    "$ce_version": 0,
                    "$current_url": "http://localhost:3000/analytics/app/create",
                    "$device_id": "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    "$device_type": "Desktop",
                    "$elements": [],
                    "$event_type": "",
                    "$host": "localhost:3000",
                    "$insert_id": "uyvllc1rseh4gdym",
                    "$lib": "web",
                    "$lib_version": "1.43.1",
                    "$os": "Mac OS X",
                    "$pageview_id": "186348305ce2227-082e406114e4e3-16525635-16a7f0-186348305cf2c5f",
                    "$pathname": "/analytics/app/create",
                    "$referrer": "http://localhost:3000/analytics/segment/create/638f1aac8e54760eafc64d70",
                    "$referring_domain": "localhost:3000",
                    "$screen_height": 982,
                    "$screen_width": 1512,
                    "$session_id": "186348305ca99b-05bdb409c347f-16525635-16a7f0-186348305cb2335",
                    "$time": 1675918247.37,
                    "$viewport_height": 780,
                    "$viewport_width": 1512,
                    "$window_id": "186348305cc2af1-0d198248776bf4-16525635-16a7f0-186348305cd2d7c",
                    "currency": "",
                    "distinct_id": "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    "price": 0,
                    "token": "63d8ef5a7b02dbd1dcf20dcc",
                },
            ),
            ClickStream(
                "test_ds_id",
                datetime(2021, 8, 10, 20, 20, 47, 370000),
                "test_user_id",
                "",
                "$pageview",
                {
                    "$browser": "Chrome",
                    "$browser_language": "en-GB",
                    "$browser_version": 109,
                    "$ce_version": 0,
                    "$current_url": "http://localhost:3000/analytics/app/create",
                    "$device_id": "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    "$device_type": "Desktop",
                    "$elements": [],
                    "$event_type": "",
                    "$host": "localhost:3000",
                    "$insert_id": "uyvllc1rseh4gdym",
                    "$lib": "web",
                    "$lib_version": "1.43.1",
                    "$os": "Mac OS X",
                    "$pageview_id": "186348305ce2227-082e406114e4e3-16525635-16a7f0-186348305cf2c5f",
                    "$pathname": "/analytics/app/create",
                    "$referrer": "http://localhost:3000/analytics/segment/create/638f1aac8e54760eafc64d70",
                    "$referring_domain": "localhost:3000",
                    "$screen_height": 982,
                    "$screen_width": 1512,
                    "$session_id": "186348305ca99b-05bdb409c347f-16525635-16a7f0-186348305cb2335",
                    "$time": 1675918247.37,
                    "$viewport_height": 780,
                    "$viewport_width": 1512,
                    "$window_id": "186348305cc2af1-0d198248776bf4-16525635-16a7f0-186348305cd2d7c",
                    "currency": "",
                    "distinct_id": "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    "price": 0,
                    "token": "63d8ef5a7b02dbd1dcf20dcc",
                },
            ),
        ]

        self.clickhouse.save_events(cs_events)

        self.clickhouse.client.insert.assert_called_once_with(
            "clickstream",
            cs_events,
            column_names=[
                "datasource_id",
                "timestamp",
                "user_id",
                "element_chain",
                "event",
                "properties",
            ],
            settings={"insert_async": True, "wait_for_async_insert": False},
        )
