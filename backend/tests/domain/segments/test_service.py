from unittest.mock import MagicMock

import pytest

from domain.segments.service import SegmentService
from domain.segments.models import (
    SegmentFilter,
    SegmentFilterOperators,
    SegmentFilterConditions,
    SegmentGroup,
    ComputedSegment,
)


class TestSegmentService:
    def setup_method(self):
        self.segments = MagicMock()
        self.service = SegmentService(segments=self.segments)
        self.ds_id = "test-id"
        self.filters = [
            SegmentFilter(
                operator=SegmentFilterOperators.EQUALS,
                operand="prop1",
                values=["va1", "val2"],
            ),
            SegmentFilter(
                operator=SegmentFilterOperators.EQUALS,
                operand="prop2",
                values=["va3", "val4"],
            ),
        ]
        self.conditions = [SegmentFilterConditions.WHERE, SegmentFilterConditions.AND]
        self.groups = [SegmentGroup(filters=self.filters, conditions=self.conditions)]
        self.columns = ["prop1", "prop2", "prop3"]

    @pytest.mark.asyncio
    async def test_compute_segment(self):
        self.segments.get_segment.return_value = [
            ("a", "b", "c", "d"),
            ("e", "f", "g", "h"),
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
        self.segments.get_segment.assert_called_once_with(
            **{
                "columns": ["user_id", "prop1", "prop2", "prop3"],
                "datasource_id": "test-id",
                "group_conditions": [],
                "groups": [
                    SegmentGroup(
                        filters=[
                            SegmentFilter(
                                operator=SegmentFilterOperators.EQUALS,
                                operand="prop1",
                                values=["va1", "val2"],
                            ),
                            SegmentFilter(
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
