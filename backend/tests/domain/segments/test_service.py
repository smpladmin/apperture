from collections import namedtuple
from unittest.mock import MagicMock, ANY, AsyncMock

import pytest
from beanie import PydanticObjectId

from domain.segments.service import SegmentService
from domain.segments.models import (
    WhoSegmentFilter,
    WhereSegmentFilter,
    SegmentFilterOperators,
    SegmentFilterConditions,
    SegmentGroup,
    ComputedSegment,
    Segment,
)


class TestSegmentService:
    def setup_method(self):
        Segment.get_settings = MagicMock()
        Segment.insert = AsyncMock()
        self.segments = MagicMock()
        self.mongo = MagicMock()
        self.service = SegmentService(segments=self.segments, mongo=self.mongo)
        self.ds_id = "63771fc960527aba9354399c"
        Segment.app_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        self.filters = [
            WhereSegmentFilter(
                operator=SegmentFilterOperators.EQUALS,
                operand="prop1",
                values=["va1", "val2"],
            ),
            WhereSegmentFilter(
                operator=SegmentFilterOperators.EQUALS,
                operand="prop2",
                values=["va3", "val4"],
            ),
        ]
        self.conditions = [SegmentFilterConditions.WHERE, SegmentFilterConditions.AND]
        self.groups = [SegmentGroup(filters=self.filters, conditions=self.conditions)]
        self.columns = ["prop1", "prop2", "prop3"]
        self.segment = Segment(
            name="test",
            description="sample",
            datasource_id=PydanticObjectId(self.ds_id),
            user_id=PydanticObjectId(self.ds_id),
            app_id=PydanticObjectId(self.ds_id),
            groups=self.groups,
            columns=self.columns,
            group_conditions=[],
        )
        Segment.get = AsyncMock(return_value=self.segment)
        FindMock = namedtuple("FindMock", ["to_list"])
        Segment.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(return_value=[self.segment]),
            ),
        )

    @pytest.mark.asyncio
    async def test_compute_segment(self):
        self.segments.get_segment_data.return_value = [
            {"user_id": "a", "prop1": "b", "prop2": "c", "prop3": "d"},
            {"user_id": "e", "prop1": "f", "prop2": "g", "prop3": "h"},
        ]
        assert await self.service.compute_segment(
            datasource_id=self.ds_id,
            columns=self.columns,
            groups=self.groups,
            group_conditions=[],
        ) == ComputedSegment(
            count=2,
            data=[
                {"user_id": "a", "prop1": "b", "prop2": "c", "prop3": "d"},
                {"user_id": "e", "prop1": "f", "prop2": "g", "prop3": "h"},
            ],
        )
        self.segments.get_segment_data.assert_called_once_with(
            **{
                "columns": ["prop1", "prop2", "prop3"],
                "datasource_id": self.ds_id,
                "group_conditions": [],
                "groups": [
                    SegmentGroup(
                        filters=[
                            WhereSegmentFilter(
                                operator=SegmentFilterOperators.EQUALS,
                                operand="prop1",
                                values=["va1", "val2"],
                            ),
                            WhereSegmentFilter(
                                operator=SegmentFilterOperators.EQUALS,
                                operand="prop2",
                                values=["va3", "val4"],
                            ),
                        ],
                        conditions=[
                            SegmentFilterConditions.WHERE,
                            SegmentFilterConditions.AND,
                        ],
                    )
                ],
            }
        )

    @pytest.mark.asyncio
    async def test_build_segment(self):
        segment = await self.service.build_segment(
            datasourceId=PydanticObjectId(self.ds_id),
            appId=PydanticObjectId(self.ds_id),
            userId=PydanticObjectId(self.ds_id),
            name="test",
            description="sample",
            groups=self.groups,
            groupConditions=[],
            columns=self.columns,
        )

        assert segment.dict() == {
            "app_id": PydanticObjectId("63771fc960527aba9354399c"),
            "columns": ["prop1", "prop2", "prop3"],
            "created_at": ANY,
            "datasource_id": PydanticObjectId("63771fc960527aba9354399c"),
            "description": "sample",
            "group_conditions": [],
            "groups": [
                {
                    "conditions": [
                        SegmentFilterConditions.WHERE,
                        SegmentFilterConditions.AND,
                    ],
                    "filters": [
                        {
                            "operand": "prop1",
                            "operator": SegmentFilterOperators.EQUALS,
                            "values": ["va1", "val2"],
                            "type": SegmentFilterConditions.WHERE,
                        },
                        {
                            "operand": "prop2",
                            "operator": SegmentFilterOperators.EQUALS,
                            "values": ["va3", "val4"],
                            "type": SegmentFilterConditions.WHERE,
                        },
                    ],
                }
            ],
            "id": None,
            "name": "test",
            "revision_id": ANY,
            "updated_at": None,
            "user_id": PydanticObjectId("63771fc960527aba9354399c"),
        }

    @pytest.mark.asyncio
    async def test_add_segment(self):
        await self.service.add_segment(segment=self.segment)
        assert Segment.insert.call_args.args[0].dict() == {
            "app_id": PydanticObjectId("63771fc960527aba9354399c"),
            "columns": ["prop1", "prop2", "prop3"],
            "created_at": ANY,
            "datasource_id": PydanticObjectId("63771fc960527aba9354399c"),
            "description": "sample",
            "group_conditions": [],
            "groups": [
                {
                    "conditions": [
                        SegmentFilterConditions.WHERE,
                        SegmentFilterConditions.AND,
                    ],
                    "filters": [
                        {
                            "operand": "prop1",
                            "operator": SegmentFilterOperators.EQUALS,
                            "values": ["va1", "val2"],
                            "type": SegmentFilterConditions.WHERE,
                        },
                        {
                            "operand": "prop2",
                            "operator": SegmentFilterOperators.EQUALS,
                            "values": ["va3", "val4"],
                            "type": SegmentFilterConditions.WHERE,
                        },
                    ],
                }
            ],
            "id": None,
            "name": "test",
            "revision_id": ANY,
            "updated_at": ANY,
            "user_id": PydanticObjectId("63771fc960527aba9354399c"),
        }

    @pytest.mark.asyncio
    async def test_get_segment(self):
        assert (
            await self.service.get_segment(segment_id="63771fc960527aba9354399c")
            == self.segment
        )
        Segment.get.assert_called_once_with(
            PydanticObjectId("63771fc960527aba9354399c"),
        )

    @pytest.mark.asyncio
    async def test_get_segments_for_app(self):
        assert await self.service.get_segments_for_app(app_id=self.ds_id) == [
            self.segment
        ]
        Segment.find.assert_called_once_with(
            False,
        )
