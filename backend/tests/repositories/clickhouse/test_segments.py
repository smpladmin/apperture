from unittest.mock import MagicMock, call

import pytest

from domain.segments.models import (
    SegmentGroup,
    WhoSegmentFilter,
    WhereSegmentFilter,
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
        self.composite_filters = [
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
            WhoSegmentFilter(
                operand="Topic_Click",
                operator=SegmentFilterOperators.EQUALS,
                values=["2"],
                triggered=True,
                aggregation="total",
            ),
            WhoSegmentFilter(
                operand="Video_Open",
                operator=SegmentFilterOperators.EQUALS,
                values=["3"],
                triggered=False,
                aggregation="total",
            ),
        ]
        self.who_filters = [
            WhoSegmentFilter(
                operand="Topic_Click",
                operator=SegmentFilterOperators.EQUALS,
                values=["2"],
                triggered=True,
                aggregation="total",
            ),
            WhoSegmentFilter(
                operand="Video_Open",
                operator=SegmentFilterOperators.EQUALS,
                values=["3"],
                triggered=False,
                aggregation="total",
            ),
        ]
        self.and_conditions = [
            SegmentFilterConditions.WHERE,
            SegmentFilterConditions.AND,
        ]
        self.or_conditions = [SegmentFilterConditions.WHERE, SegmentFilterConditions.OR]
        self.composite_conditions = [
            SegmentFilterConditions.WHERE,
            SegmentFilterConditions.AND,
            SegmentFilterConditions.WHO,
            SegmentFilterConditions.OR,
        ]
        self.who_conditions = [
            SegmentFilterConditions.WHO,
            SegmentFilterConditions.AND,
        ]
        self.groups = [
            SegmentGroup(filters=self.filters, conditions=self.and_conditions),
            SegmentGroup(filters=self.who_filters, conditions=self.who_conditions),
            SegmentGroup(
                filters=self.composite_filters, conditions=self.composite_conditions
            ),
        ]
        self.columns = ["prop1", "prop2", "prop3"]
        self.params = {"ds_id": "test-id"}
        self.where_filters_query = (
            'SELECT DISTINCT "user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
            '"properties.prop1" IN (\'va1\',\'val2\') AND "properties.prop2" IN '
            "('va3','val4')"
        )
        self.who_filters_query = (
            'WITH cte0 AS (SELECT "user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s '
            'AND "user_id" IN (SELECT DISTINCT "user_id" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s) AND "event_name"=\'Topic_Click\' GROUP BY '
            '"user_id" HAVING COUNT("user_id")=\'2\') ,cte1 AS (SELECT "user_id" FROM '
            '"events" WHERE "datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT '
            '"user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s) AND '
            '"event_name"<>\'Video_Open\') SELECT DISTINCT "cte0"."user_id" FROM cte0 '
            'INTERSECT SELECT DISTINCT "cte1"."user_id" FROM cte1'
        )
        self.composite_filters_query = (
            'WITH cte2 AS (SELECT "user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s '
            'AND "user_id" IN (SELECT DISTINCT "user_id" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "properties.prop1" IN (\'va1\',\'val2\') AND '
            '"properties.prop2" IN (\'va3\',\'val4\')) AND "event_name"=\'Topic_Click\' '
            'GROUP BY "user_id" HAVING COUNT("user_id")=\'2\') ,cte3 AS (SELECT "user_id" '
            'FROM "events" WHERE "datasource_id"=%(ds_id)s AND "user_id" IN (SELECT '
            'DISTINCT "user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
            '"properties.prop1" IN (\'va1\',\'val2\') AND "properties.prop2" IN '
            '(\'va3\',\'val4\')) AND "event_name"<>\'Video_Open\') SELECT DISTINCT '
            '"cte2"."user_id" FROM cte2 UNION ALL SELECT DISTINCT "cte3"."user_id" FROM '
            'cte3'
        )

    def test_get_all_unique_users_query(self):
        assert (
            self.repo.get_all_unique_users_query().get_sql()
            == 'SELECT DISTINCT "user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s'
        )

    @pytest.mark.parametrize("group_idx, return_idx", [(0, 0), (2, 2)])
    def test_build_where_clause_users_query(self, group_idx, return_idx):
        segment_users = self.repo.get_all_unique_users_query()
        users, idx = self.repo.build_where_clause_users_query(
            group=self.groups[group_idx], group_users=segment_users
        )
        assert users.get_sql() == self.where_filters_query
        assert idx == return_idx

    def test_build_who_clause_users_query_for_composite_filters(self):
        group = self.groups[2]
        segment_users = self.repo.get_all_unique_users_query()
        segment_users, idx = self.repo.build_where_clause_users_query(
            group=group, group_users=segment_users
        )
        segment_users = self.repo.build_who_clause_users_query(
            group=group, group_users=segment_users, idx=idx
        )
        assert segment_users.get_sql() == self.composite_filters_query

    def test_build_who_clause_users_query_for_who_filters(self):
        segment_users = self.repo.get_all_unique_users_query()
        segment_users = self.repo.build_who_clause_users_query(
            group=self.groups[1], group_users=segment_users, idx=0
        )
        assert segment_users.get_sql() == self.who_filters_query

    def test_build_segment_users_query_for_where_filters(self):
        assert (
            self.repo.build_segment_users_query(
                groups=self.groups[:1], group_conditions=[]
            ).get_sql()
<<<<<<< HEAD
            == self.where_filters_query
=======
            == (
                'WITH group0 AS (SELECT DISTINCT "user_id" FROM "events" WHERE '
                '"datasource_id"=%(ds_id)s AND "properties.prop1" IN (\'va1\',\'val2\') AND '
                '"properties.prop2" IN (\'va3\',\'val4\')) SELECT DISTINCT "group0"."user_id" '
                'FROM group0'
            )
>>>>>>> main
        )

    def test_build_segment_users_query_for_who_filters(self):
        assert (
            self.repo.build_segment_users_query(
                groups=self.groups[1:2], group_conditions=[]
            ).get_sql()
<<<<<<< HEAD
            == self.who_filters_query
=======
            == (
                'WITH group0 AS (WITH cte0 AS (SELECT "user_id" FROM "events" WHERE '
                '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT "user_id" FROM '
                '"events" WHERE "datasource_id"=%(ds_id)s) AND "event_name"=\'Topic_Click\' '
                'GROUP BY "user_id" HAVING COUNT("user_id")=\'2\') ,cte1 AS (SELECT "user_id" '
                'FROM "events" WHERE "datasource_id"=%(ds_id)s AND "user_id" IN (SELECT '
                'DISTINCT "user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s) AND '
                '"event_name"<>\'Video_Open\') SELECT DISTINCT "cte0"."user_id" FROM cte0 '
                'INTERSECT SELECT DISTINCT "cte1"."user_id" FROM cte1) SELECT DISTINCT '
                '"group0"."user_id" FROM group0'
            )
>>>>>>> main
        )

    def test_build_segment_users_query_for_composite_filters(self):
        assert (
            self.repo.build_segment_users_query(
                groups=self.groups[2:], group_conditions=[]
            ).get_sql()
<<<<<<< HEAD
            == self.composite_filters_query
=======
            == (
                'WITH group0 AS (WITH cte2 AS (SELECT "user_id" FROM "events" WHERE '
                '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT "user_id" FROM '
                '"events" WHERE "datasource_id"=%(ds_id)s AND "properties.prop1" IN '
                '(\'va1\',\'val2\') AND "properties.prop2" IN (\'va3\',\'val4\')) AND '
                '"event_name"=\'Topic_Click\' GROUP BY "user_id" HAVING '
                'COUNT("user_id")=\'2\') ,cte3 AS (SELECT "user_id" FROM "events" WHERE '
                '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT "user_id" FROM '
                '"events" WHERE "datasource_id"=%(ds_id)s AND "properties.prop1" IN '
                '(\'va1\',\'val2\') AND "properties.prop2" IN (\'va3\',\'val4\')) AND '
                '"event_name"<>\'Video_Open\') SELECT DISTINCT "cte2"."user_id" FROM cte2 '
                'UNION ALL SELECT DISTINCT "cte3"."user_id" FROM cte3) SELECT DISTINCT '
                '"group0"."user_id" FROM group0'
            )
>>>>>>> main
        )

    def test_build_valid_column_data_query(self):
        assert self.repo.build_valid_column_data_query(
            column=self.columns[0],
            segment_users_query=self.repo.build_segment_users_query(
                groups=self.groups[1:2], group_conditions=[]
            ),
        ) == (
            (
                'WITH column_data AS (SELECT "user_id","timestamp","properties.prop1",RANK() '
                'OVER(PARTITION BY "user_id" ORDER BY "timestamp" DESC) AS "Rank" FROM '
                '"events" WHERE "datasource_id"=%(ds_id)s AND '
                'char_length(toString("properties.prop1"))>0 AND "user_id" IN (WITH group0 AS '
                '(WITH cte0 AS (SELECT "user_id" FROM "events" WHERE '
                '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT "user_id" FROM '
                '"events" WHERE "datasource_id"=%(ds_id)s) AND "event_name"=\'Topic_Click\' '
                'GROUP BY "user_id" HAVING COUNT("user_id")=\'2\') ,cte1 AS (SELECT "user_id" '
                'FROM "events" WHERE "datasource_id"=%(ds_id)s AND "user_id" IN (SELECT '
                'DISTINCT "user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s) AND '
                '"event_name"<>\'Video_Open\') SELECT DISTINCT "cte0"."user_id" FROM cte0 '
                'INTERSECT SELECT DISTINCT "cte1"."user_id" FROM cte1) SELECT DISTINCT '
                '"group0"."user_id" FROM group0) ORDER BY "user_id") SELECT '
                '"properties.prop1","user_id" FROM column_data WHERE "Rank"=1 ORDER BY '
                '"user_id"'
            )
        )

    def test_get_segment_data_for_single_group(self):
        self.repo.execute_get_query = MagicMock()
        self.repo.get_segment_data(
            datasource_id=self.datasource_id,
            groups=self.groups[1:2],
            columns=self.columns,
            group_conditions=[],
        )
        calls = [
            call(
                parameters=self.params,
                query=(
                    "WITH column_data AS (SELECT "
                    f'"user_id","timestamp","properties.{column}",RANK() OVER(PARTITION BY '
                    '"user_id" ORDER BY "timestamp" DESC) AS "Rank" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "user_id" IN (WITH cte0 AS (SELECT '
                    '"user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
                    '"user_id" IN (SELECT DISTINCT "user_id" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s) AND "event_name"=\'Topic_Click\' GROUP '
                    'BY "user_id" HAVING COUNT("user_id")=\'2\') ,cte1 AS (SELECT '
                    '"user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
                    '"user_id" IN (SELECT DISTINCT "user_id" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s) AND "event_name"<>\'Video_Open\') SELECT '
                    'DISTINCT "cte0"."user_id" FROM cte0 INTERSECT SELECT DISTINCT '
                    '"cte1"."user_id" FROM cte1) AND '
                    f'char_length(toString("properties.{column}"))>0 ORDER BY "user_id") '
                    f'SELECT "properties.{column}","user_id" FROM column_data WHERE "Rank"=1 '
                    'ORDER BY "user_id"'
                ),
            )
            for column in self.columns
        ]

        self.repo.execute_get_query.assert_has_calls(calls=calls, any_order=True)
