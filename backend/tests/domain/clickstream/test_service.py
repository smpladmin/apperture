import datetime
from unittest.mock import MagicMock

import pytest

from domain.clickstream.models import ClickstreamResult
from domain.clickstream.service import ClickstreamService


class TestClickstreamService:
    def setup_method(self):
        self.clickhouse = MagicMock()
        self.clickstream = MagicMock()
        self.elements_service = MagicMock()
        self.clickhouse.client = MagicMock()
        self.service = ClickstreamService(
            clickhouse=self.clickhouse,
            clickstream=self.clickstream,
            elements_service=self.elements_service,
        )
        self.datasource_id = "63d8ef5a7b02dbd1dcf20dcc"
        self.clickstream_data_response = {
            "count": 105,
            "data": [
                ClickstreamResult(
                    event="$pageview",
                    timestamp=datetime.datetime(2023, 2, 9, 4, 50, 47),
                    uid="1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    url="http://localhost:3000/analytics/app/create",
                    source="web",
                ),
                ClickstreamResult(
                    event="$pageview",
                    timestamp=datetime.datetime(2023, 2, 7, 8, 45, 13),
                    uid="1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    url="http://localhost:3000/analytics/funnel/list/63d8ef5a7b02dbd1dcf20dcc",
                    source="web",
                ),
            ],
        }
        self.clickstream_data_list = [
            (
                "$pageview",
                datetime.datetime(2023, 2, 9, 4, 50, 47),
                "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
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
            (
                "$pageview",
                datetime.datetime(2023, 2, 7, 8, 45, 13),
                "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                {
                    "$browser": "Chrome",
                    "$browser_language": "en-GB",
                    "$browser_version": 109,
                    "$ce_version": 0,
                    "$current_url": "http://localhost:3000/analytics/funnel/list/63d8ef5a7b02dbd1dcf20dcc",
                    "$device_id": "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    "$device_type": "Desktop",
                    "$elements": [],
                    "$event_type": "",
                    "$host": "localhost:3000",
                    "$insert_id": "lxrb37afwxh5m9os",
                    "$lib": "web",
                    "$lib_version": "1.42.3",
                    "$os": "Mac OS X",
                    "$pageview_id": "1862b0ceefb103f-00fa038f316c54-16525635-16a7f0-1862b0ceefc23fc",
                    "$pathname": "/analytics/funnel/list/63d8ef5a7b02dbd1dcf20dcc",
                    "$referrer": "$direct",
                    "$referring_domain": "$direct",
                    "$screen_height": 982,
                    "$screen_width": 1512,
                    "$session_id": "1862aea5c8d1e45-004ca19f69c8b6-16525635-16a7f0-1862aea5c8e1af5",
                    "$time": 1675759513.339,
                    "$viewport_height": 247,
                    "$viewport_width": 1512,
                    "$window_id": "1862aea5c9019ee-0ddae5154e493a-16525635-16a7f0-1862aea5c9124c2",
                    "currency": "",
                    "distinct_id": "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    "price": 0,
                    "token": "63d8ef5a7b02dbd1dcf20dcc",
                },
            ),
        ]
        self.clickstream.get_all_data_by_dsId = MagicMock(
            return_value=self.clickstream_data_list
        )
        self.clickstream.get_stream_count_by_dsId = MagicMock(return_value=[[(105)]])

    @pytest.mark.asyncio
    async def test_get_data_by_id(self):
        result = self.service.get_data_by_id(self.datasource_id)
        assert result == self.clickstream_data_response
