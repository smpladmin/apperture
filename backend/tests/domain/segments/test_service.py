from collections import namedtuple
from unittest.mock import ANY, AsyncMock, MagicMock

import pytest
from beanie import PydanticObjectId

from domain.common.filter_models import (
    FilterDataType,
    FilterOperatorsString,
    LogicalOperators,
)
from domain.segments.models import (
    ComputedSegment,
    Segment,
    SegmentFilterConditions,
    SegmentGroup,
    WhereSegmentFilter,
)
from domain.segments.service import SegmentService


class TestSegmentService:
    def setup_method(self):
        Segment.get_settings = MagicMock()
        Segment.insert = AsyncMock()
        self.segments = MagicMock()
        self.mongo = MagicMock()
        self.service = SegmentService(segments=self.segments, mongo=self.mongo)
        self.ds_id = "63771fc960527aba9354399c"
        self.app_id = "63771fc960527aba9354399a"
        Segment.app_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        Segment.datasource_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        self.filters = [
            WhereSegmentFilter(
                operator=FilterOperatorsString.IS,
                operand="prop1",
                values=["va1", "val2"],
                all=False,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.WHERE,
                datatype=FilterDataType.STRING,
            ),
            WhereSegmentFilter(
                operator=FilterOperatorsString.IS,
                operand="prop2",
                values=["va3", "val4"],
                all=False,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.AND,
                datatype=FilterDataType.STRING,
            ),
        ]
        self.groups = [
            SegmentGroup(filters=self.filters, condition=LogicalOperators.AND)
        ]
        self.columns = ["prop1", "prop2", "prop3"]
        self.segment = Segment(
            name="test",
            description="sample",
            datasource_id=PydanticObjectId(self.ds_id),
            user_id=PydanticObjectId(self.ds_id),
            app_id=PydanticObjectId(self.ds_id),
            groups=self.groups,
            columns=self.columns,
            enabled=True,
        )
        self.segment_id = "63771fc960527aba93543998"
        self.update_mock = AsyncMock()
        Segment.get = AsyncMock(return_value=self.segment)
        FindMock = namedtuple("FindMock", ["to_list"])
        FindOneMock = namedtuple("FindOneMock", ["update"])
        Segment.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(return_value=[self.segment]),
            ),
        )
        Segment.find_one = MagicMock(return_value=FindOneMock(update=self.update_mock))
        Segment.id = MagicMock(return_value=PydanticObjectId(self.segment_id))
        Segment.enabled = True

    @pytest.mark.asyncio
    async def test_compute_segment(self):
        self.segments.get_segment_data = AsyncMock()
        self.segments.get_segment_data.return_value = [
            {"user_id": "a", "prop1": "b", "prop2": "c", "prop3": "d"},
            {"user_id": "e", "prop1": "f", "prop2": "g", "prop3": "h"},
        ], 2
        assert await self.service.compute_segment(
            datasource_id=self.ds_id,
            columns=self.columns,
            groups=self.groups,
            app_id=self.app_id,
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
                "app_id": "63771fc960527aba9354399a",
                "groups": [
                    SegmentGroup(
                        filters=[
                            WhereSegmentFilter(
                                operand="prop1",
                                operator=FilterOperatorsString.IS,
                                values=["va1", "val2"],
                                all=False,
                                condition=SegmentFilterConditions.WHERE,
                                type=SegmentFilterConditions.WHERE,
                                datatype=FilterDataType.STRING,
                            ),
                            WhereSegmentFilter(
                                operand="prop2",
                                operator=FilterOperatorsString.IS,
                                values=["va3", "val4"],
                                all=False,
                                condition=SegmentFilterConditions.AND,
                                type=SegmentFilterConditions.WHERE,
                                datatype=FilterDataType.STRING,
                            ),
                        ],
                        condition=LogicalOperators.AND,
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
            columns=self.columns,
        )

        assert segment.dict() == {
            "app_id": PydanticObjectId("63771fc960527aba9354399c"),
            "columns": ["prop1", "prop2", "prop3"],
            "created_at": ANY,
            "datasource_id": PydanticObjectId("63771fc960527aba9354399c"),
            "description": "sample",
            "groups": [
                {
                    "condition": LogicalOperators.AND,
                    "filters": [
                        {
                            "all": False,
                            "condition": SegmentFilterConditions.WHERE,
                            "operand": "prop1",
                            "operator": FilterOperatorsString.IS,
                            "values": ["va1", "val2"],
                            "type": SegmentFilterConditions.WHERE,
                            "datatype": FilterDataType.STRING,
                        },
                        {
                            "all": False,
                            "condition": SegmentFilterConditions.AND,
                            "operand": "prop2",
                            "operator": FilterOperatorsString.IS,
                            "values": ["va3", "val4"],
                            "type": SegmentFilterConditions.WHERE,
                            "datatype": FilterDataType.STRING,
                        },
                    ],
                }
            ],
            "id": None,
            "name": "test",
            "revision_id": ANY,
            "updated_at": None,
            "user_id": PydanticObjectId("63771fc960527aba9354399c"),
            "enabled": True,
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
            "groups": [
                {
                    "condition": LogicalOperators.AND,
                    "filters": [
                        {
                            "all": False,
                            "condition": SegmentFilterConditions.WHERE,
                            "operand": "prop1",
                            "operator": FilterOperatorsString.IS,
                            "values": ["va1", "val2"],
                            "type": SegmentFilterConditions.WHERE,
                            "datatype": FilterDataType.STRING,
                        },
                        {
                            "all": False,
                            "condition": SegmentFilterConditions.AND,
                            "operand": "prop2",
                            "operator": FilterOperatorsString.IS,
                            "values": ["va3", "val4"],
                            "type": SegmentFilterConditions.WHERE,
                            "datatype": FilterDataType.STRING,
                        },
                    ],
                }
            ],
            "id": None,
            "name": "test",
            "revision_id": ANY,
            "updated_at": ANY,
            "user_id": PydanticObjectId("63771fc960527aba9354399c"),
            "enabled": True,
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
        Segment.find.assert_called_once_with(False, True)

    @pytest.mark.asyncio
    async def test_update_segment(self):
        await self.service.update_segment(
            segment_id=self.segment_id, new_segment=self.segment
        )
        self.update_mock.assert_called_once_with(
            {
                "$set": {
                    "app_id": PydanticObjectId("63771fc960527aba9354399c"),
                    "columns": ["prop1", "prop2", "prop3"],
                    "datasource_id": PydanticObjectId("63771fc960527aba9354399c"),
                    "description": "sample",
                    "groups": [
                        {
                            "condition": LogicalOperators.AND,
                            "filters": [
                                {
                                    "all": False,
                                    "condition": SegmentFilterConditions.WHERE,
                                    "operand": "prop1",
                                    "operator": FilterOperatorsString.IS,
                                    "values": ["va1", "val2"],
                                    "type": SegmentFilterConditions.WHERE,
                                    "datatype": FilterDataType.STRING,
                                },
                                {
                                    "all": False,
                                    "condition": SegmentFilterConditions.AND,
                                    "operand": "prop2",
                                    "operator": FilterOperatorsString.IS,
                                    "values": ["va3", "val4"],
                                    "type": SegmentFilterConditions.WHERE,
                                    "datatype": FilterDataType.STRING,
                                },
                            ],
                        }
                    ],
                    "name": "test",
                    "revision_id": ANY,
                    "updated_at": ANY,
                    "user_id": PydanticObjectId("63771fc960527aba9354399c"),
                    "enabled": True,
                }
            }
        )

    @pytest.mark.asyncio
    async def test_get_segments_for_datasource_id(self):
        await self.service.get_segments_for_datasource_id(
            datasource_id="6384a65e0a397236d9de236a"
        )
        Segment.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_segments_for_app(self):
        await self.service.get_segments_for_app(app_id="6384a65e0a397236d9de236a")
        Segment.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_segment(self):
        await self.service.delete_segment(segment_id="6384a65e0a397236d9de236a")
        Segment.find_one.assert_called_once()
        self.update_mock.assert_called_once_with({"$set": {"enabled": False}})
