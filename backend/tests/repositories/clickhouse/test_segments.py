from unittest.mock import MagicMock

from domain.segments.models import (
    SegmentGroup,
    SegmentFilter,
    SegmentFilterOperators,
    SegmentFilterConditions,
)
from repositories.clickhouse.segments import Segments


class TestSegmentsRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Segments(self.clickhouse)
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.datasource_id = "test-id"
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
        self.and_conditions = [
            SegmentFilterConditions.WHERE,
            SegmentFilterConditions.AND,
        ]
        self.or_conditions = [SegmentFilterConditions.WHERE, SegmentFilterConditions.OR]
        self.groups = [
            SegmentGroup(filters=self.filters, conditions=self.and_conditions)
        ]
        self.columns = ["prop1", "prop2", "prop3"]
        self.params = {"ds_id": "test-id"}
        self.query = (
            "WITH cte AS (SELECT "
            '"user_id","properties.prop1","properties.prop2","properties.prop3",RANK() '
            'OVER(PARTITION BY "user_id" ORDER BY "timestamp" DESC) AS "rank" FROM '
            '"events" WHERE "datasource_id"=%(ds_id)s AND "properties.prop1" IN '
            "('va1','val2') AND \"properties.prop2\" IN ('va3','val4')) SELECT * "
            'FROM cte WHERE "rank"=1'
        )
        self.or_query = (
            "WITH cte AS (SELECT "
            '"user_id","properties.prop1","properties.prop2","properties.prop3",RANK() '
            'OVER(PARTITION BY "user_id" ORDER BY "timestamp" DESC) AS "rank" FROM '
            '"events" WHERE "datasource_id"=%(ds_id)s AND ("properties.prop1" IN '
            "('va1','val2') OR \"properties.prop2\" IN ('va3','val4'))) SELECT * "
            'FROM cte WHERE "rank"=1'
        )

    def test_get_segment(self):
        self.repo.get_segment(
            datasource_id=self.datasource_id,
            groups=self.groups,
            columns=self.columns,
            group_conditions=[],
        )
        self.repo.execute_get_query.assert_called_once_with(self.query, self.params)

    def test_build_segment_query_for_single_group_with_and(self):
        assert self.repo.build_segment_query(
            datasource_id=self.datasource_id,
            groups=self.groups,
            columns=self.columns,
            group_conditions=[],
        ) == (self.query, self.params)

    def test_build_segment_query_for_single_group_with_or(self):
        assert self.repo.build_segment_query(
            datasource_id=self.datasource_id,
            groups=[SegmentGroup(filters=self.filters, conditions=self.or_conditions)],
            columns=self.columns,
            group_conditions=[],
        ) == (self.or_query, self.params)
