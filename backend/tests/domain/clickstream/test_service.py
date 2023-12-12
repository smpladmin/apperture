import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from domain.clickstream.models import (
    ClickstreamResult,
    ComputedStreamElementProperty,
    ComputedStreamEvent,
)
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
        self.app_id = "63d8ef5a7b02dbd1dcf20dcd"
        self.clickstream_data_response = {
            "count": 105,
            "data": [
                ClickstreamResult(
                    event=ComputedStreamEvent(
                        name="$pageview",
                        type="",
                        elements=ComputedStreamElementProperty(
                            href="", text="", tag_name=""
                        ),
                    ),
                    timestamp=datetime.datetime(2023, 2, 9, 4, 50, 47),
                    uid="1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    url="http://localhost:3000/analytics/app/create",
                    source="web",
                ),
                ClickstreamResult(
                    event=ComputedStreamEvent(
                        name="$pageview",
                        type="",
                        elements=ComputedStreamElementProperty(
                            href="", text="", tag_name=""
                        ),
                    ),
                    timestamp=datetime.datetime(2023, 2, 7, 8, 45, 13),
                    uid="1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    url="http://localhost:3000/analytics/funnel/list/63d8ef5a7b02dbd1dcf20dcc",
                    source="web",
                ),
                ClickstreamResult(
                    event=ComputedStreamEvent(
                        name="$autocapture",
                        type="click",
                        elements=ComputedStreamElementProperty(
                            href="", text="Add to cart", tag_name="button"
                        ),
                    ),
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
                "http://localhost:3000/analytics/app/create",
                "web",
                "",
                [],
                [],
                [],
            ),
            (
                "$pageview",
                datetime.datetime(2023, 2, 7, 8, 45, 13),
                "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                "http://localhost:3000/analytics/funnel/list/63d8ef5a7b02dbd1dcf20dcc",
                "web",
                "",
                [],
                [],
                [],
            ),
            (
                "$autocapture",
                datetime.datetime(2023, 2, 7, 8, 45, 13),
                "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                "http://localhost:3000/analytics/funnel/list/63d8ef5a7b02dbd1dcf20dcc",
                "web",
                "click",
                ["button"],
                ["Add to cart"],
                [],
            ),
        ]
        self.clickstream.get_all_data_by_dsId = AsyncMock(
            return_value=self.clickstream_data_list
        )
        self.clickstream.get_stream_count_by_dsId = AsyncMock(return_value=[[(105)]])

    @pytest.mark.asyncio
    async def test_get_data_by_id(self):
        result = await self.service.get_data_by_id(
            self.datasource_id, app_id=self.app_id
        )
        assert result == self.clickstream_data_response
