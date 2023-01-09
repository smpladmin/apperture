import pytest
from datetime import datetime as dt
from unittest.mock import MagicMock, call

from pypika import Field, CustomFunction

from domain.segments.models import (
    SegmentGroup,
    WhoSegmentFilter,
    WhereSegmentFilter,
    SegmentFilterOperatorsNumber,
    SegmentFilterOperatorsBool,
    SegmentFilterOperatorsString,
    SegmentFilterConditions,
    SegmentGroupConditions,
    SegmentFixedDateFilter,
    SegmentLastDateFilter,
    SegmentSinceDateFilter,
    SegmentDateFilterType,
    SegmentDataType,
)
from repositories.clickhouse.segments import Segments


class TestSegmentsRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Segments(self.clickhouse)
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.convert_to_float_func = CustomFunction("toFloat64OrNull", ["string"])
        self.datasource_id = "test-id"
        self.filters = [
            WhereSegmentFilter(
                operator=SegmentFilterOperatorsString.IS,
                operand="prop1",
                values=["va1", "val2"],
                all=False,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.WHERE,
                datatype=SegmentDataType.STRING,
            ),
            WhereSegmentFilter(
                operator=SegmentFilterOperatorsString.IS,
                operand="prop2",
                values=["va3", "val4"],
                all=False,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.AND,
                datatype=SegmentDataType.STRING,
            ),
        ]
        self.where_select_all_filters = [
            WhereSegmentFilter(
                operator=SegmentFilterOperatorsString.IS,
                operand="prop1",
                values=["va1", "val2"],
                all=False,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.WHERE,
                datatype=SegmentDataType.STRING,
            ),
            WhereSegmentFilter(
                operator=SegmentFilterOperatorsString.IS,
                operand="prop2",
                values=["va3", "val4"],
                all=True,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.AND,
                datatype=SegmentDataType.STRING,
            ),
        ]
        self.composite_filters = [
            WhereSegmentFilter(
                operator=SegmentFilterOperatorsString.IS,
                operand="prop1",
                values=["va1", "val2"],
                all=False,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.WHERE,
                datatype=SegmentDataType.STRING,
            ),
            WhereSegmentFilter(
                operator=SegmentFilterOperatorsString.IS,
                operand="prop2",
                values=["va3", "val4"],
                all=False,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.AND,
                datatype=SegmentDataType.STRING,
            ),
            WhoSegmentFilter(
                operand="Topic_Click",
                operator=SegmentFilterOperatorsString.IS,
                values=["2"],
                triggered=True,
                aggregation="total",
                type=SegmentFilterConditions.WHO,
                condition=SegmentFilterConditions.WHO,
                date_filter=SegmentFixedDateFilter(
                    start_date="2022-01-01", end_date="2023-01-01"
                ),
                date_filter_type=SegmentDateFilterType.FIXED,
                datatype=SegmentDataType.STRING,
            ),
            WhoSegmentFilter(
                operand="Video_Open",
                operator=SegmentFilterOperatorsString.IS,
                values=["3"],
                triggered=False,
                aggregation="total",
                type=SegmentFilterConditions.WHO,
                condition=SegmentFilterConditions.OR,
                date_filter=SegmentFixedDateFilter(
                    start_date="2022-01-01", end_date="2023-01-01"
                ),
                date_filter_type=SegmentDateFilterType.FIXED,
                datatype=SegmentDataType.STRING,
            ),
        ]
        self.who_filters = [
            WhoSegmentFilter(
                operand="Topic_Click",
                operator=SegmentFilterOperatorsString.IS,
                values=["2"],
                triggered=True,
                aggregation="total",
                type=SegmentFilterConditions.WHO,
                condition=SegmentFilterConditions.WHO,
                date_filter=SegmentFixedDateFilter(
                    start_date="2022-01-01", end_date="2023-01-01"
                ),
                date_filter_type=SegmentDateFilterType.FIXED,
                datatype=SegmentDataType.STRING,
            ),
            WhoSegmentFilter(
                operand="Video_Open",
                operator=SegmentFilterOperatorsString.IS,
                values=["3"],
                triggered=False,
                aggregation="total",
                type=SegmentFilterConditions.WHO,
                condition=SegmentFilterConditions.AND,
                date_filter=SegmentFixedDateFilter(
                    start_date="2022-01-01", end_date="2023-01-01"
                ),
                date_filter_type=SegmentDateFilterType.FIXED,
                datatype=SegmentDataType.STRING,
            ),
        ]
        self.groups = [
            SegmentGroup(filters=self.filters, condition=SegmentGroupConditions.AND),
            SegmentGroup(
                filters=self.who_filters, condition=SegmentGroupConditions.AND
            ),
            SegmentGroup(
                filters=self.composite_filters, condition=SegmentGroupConditions.AND
            ),
        ]
        self.columns = ["col1", "col2", "col3"]
        self.params = {"ds_id": "test-id"}
        self.where_filters_query = (
            'SELECT DISTINCT "user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
            "\"properties.prop1\" IN ('va1','val2') AND \"properties.prop2\" IN "
            "('va3','val4')"
        )
        self.who_filters_query = (
            'WITH cte0 AS (SELECT "user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s '
            'AND "user_id" IN (SELECT DISTINCT "user_id" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s) AND DATE("timestamp")>=\'2022-01-01\' AND '
            "DATE(\"timestamp\")<='2023-01-01' AND \"event_name\"='Topic_Click' GROUP BY "
            '"user_id" HAVING COUNT("user_id")=\'2\') ,cte1 AS (SELECT "user_id" FROM '
            '"events" WHERE "datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT '
            '"user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s) AND '
            "DATE(\"timestamp\")>='2022-01-01' AND DATE(\"timestamp\")<='2023-01-01' AND "
            '"event_name"<>\'Video_Open\') SELECT DISTINCT "cte0"."user_id" FROM cte0 '
            'INTERSECT SELECT DISTINCT "cte1"."user_id" FROM cte1'
        )
        self.composite_filters_query = (
            'WITH cte2 AS (SELECT "user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s '
            'AND "user_id" IN (SELECT DISTINCT "user_id" FROM "events" WHERE '
            "\"datasource_id\"=%(ds_id)s AND \"properties.prop1\" IN ('va1','val2') AND "
            "\"properties.prop2\" IN ('va3','val4')) AND "
            "DATE(\"timestamp\")>='2022-01-01' AND DATE(\"timestamp\")<='2023-01-01' AND "
            '"event_name"=\'Topic_Click\' GROUP BY "user_id" HAVING '
            'COUNT("user_id")=\'2\') ,cte3 AS (SELECT "user_id" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT "user_id" FROM '
            '"events" WHERE "datasource_id"=%(ds_id)s AND "properties.prop1" IN '
            "('va1','val2') AND \"properties.prop2\" IN ('va3','val4')) AND "
            "DATE(\"timestamp\")>='2022-01-01' AND DATE(\"timestamp\")<='2023-01-01' AND "
            '"event_name"<>\'Video_Open\') SELECT DISTINCT "cte2"."user_id" FROM cte2 '
            'UNION ALL SELECT DISTINCT "cte3"."user_id" FROM cte3'
        )

    def test_get_all_unique_users_query(self):
        assert (
            self.repo.get_all_unique_users_query().get_sql()
            == 'SELECT DISTINCT "user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s'
        )

    @pytest.mark.parametrize("group_idx, return_idx", [(0, 2), (2, 2)])
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
        assert self.repo.build_segment_users_query(
            groups=self.groups[:1]
        ).get_sql() == (
            'WITH group0 AS (SELECT DISTINCT "user_id" FROM "events" WHERE '
            "\"datasource_id\"=%(ds_id)s AND \"properties.prop1\" IN ('va1','val2') AND "
            '"properties.prop2" IN (\'va3\',\'val4\')) SELECT DISTINCT "group0"."user_id" '
            "FROM group0"
        )

    def test_build_segment_users_query_for_who_filters(self):
        assert self.repo.build_segment_users_query(
            groups=self.groups[1:2]
        ).get_sql() == (
            'WITH group0 AS (WITH cte0 AS (SELECT "user_id" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT "user_id" FROM '
            '"events" WHERE "datasource_id"=%(ds_id)s) AND '
            "DATE(\"timestamp\")>='2022-01-01' AND DATE(\"timestamp\")<='2023-01-01' AND "
            '"event_name"=\'Topic_Click\' GROUP BY "user_id" HAVING '
            'COUNT("user_id")=\'2\') ,cte1 AS (SELECT "user_id" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT "user_id" FROM '
            '"events" WHERE "datasource_id"=%(ds_id)s) AND '
            "DATE(\"timestamp\")>='2022-01-01' AND DATE(\"timestamp\")<='2023-01-01' AND "
            '"event_name"<>\'Video_Open\') SELECT DISTINCT "cte0"."user_id" FROM cte0 '
            'INTERSECT SELECT DISTINCT "cte1"."user_id" FROM cte1) SELECT DISTINCT '
            '"group0"."user_id" FROM group0'
        )

    def test_build_segment_users_query_for_composite_filters(self):
        assert self.repo.build_segment_users_query(
            groups=self.groups[2:]
        ).get_sql() == (
            'WITH group0 AS (WITH cte2 AS (SELECT "user_id" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT "user_id" FROM '
            '"events" WHERE "datasource_id"=%(ds_id)s AND "properties.prop1" IN '
            "('va1','val2') AND \"properties.prop2\" IN ('va3','val4')) AND "
            "DATE(\"timestamp\")>='2022-01-01' AND DATE(\"timestamp\")<='2023-01-01' AND "
            '"event_name"=\'Topic_Click\' GROUP BY "user_id" HAVING '
            'COUNT("user_id")=\'2\') ,cte3 AS (SELECT "user_id" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT "user_id" FROM '
            '"events" WHERE "datasource_id"=%(ds_id)s AND "properties.prop1" IN '
            "('va1','val2') AND \"properties.prop2\" IN ('va3','val4')) AND "
            "DATE(\"timestamp\")>='2022-01-01' AND DATE(\"timestamp\")<='2023-01-01' AND "
            '"event_name"<>\'Video_Open\') SELECT DISTINCT "cte2"."user_id" FROM cte2 '
            'UNION ALL SELECT DISTINCT "cte3"."user_id" FROM cte3) SELECT DISTINCT '
            '"group0"."user_id" FROM group0'
        )

    def test_build_valid_column_data_query(self):
        assert self.repo.build_valid_column_data_query(
            column=self.columns[0],
            segment_users_query=self.repo.build_segment_users_query(
                groups=self.groups[1:2]
            ),
        ) == (
            (
                'WITH column_data AS (SELECT "user_id","timestamp","properties.col1",RANK() '
                'OVER(PARTITION BY "user_id" ORDER BY "timestamp" DESC) AS "Rank" FROM '
                '"events" WHERE "datasource_id"=%(ds_id)s AND '
                'char_length(toString("properties.col1"))>0 AND "user_id" IN (WITH group0 AS '
                '(WITH cte0 AS (SELECT "user_id" FROM "events" WHERE '
                '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT "user_id" FROM '
                '"events" WHERE "datasource_id"=%(ds_id)s) AND '
                "DATE(\"timestamp\")>='2022-01-01' AND DATE(\"timestamp\")<='2023-01-01' AND "
                '"event_name"=\'Topic_Click\' GROUP BY "user_id" HAVING '
                'COUNT("user_id")=\'2\') ,cte1 AS (SELECT "user_id" FROM "events" WHERE '
                '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT "user_id" FROM '
                '"events" WHERE "datasource_id"=%(ds_id)s) AND '
                "DATE(\"timestamp\")>='2022-01-01' AND DATE(\"timestamp\")<='2023-01-01' AND "
                '"event_name"<>\'Video_Open\') SELECT DISTINCT "cte0"."user_id" FROM cte0 '
                'INTERSECT SELECT DISTINCT "cte1"."user_id" FROM cte1) SELECT DISTINCT '
                '"group0"."user_id" FROM group0) ORDER BY "user_id") SELECT '
                '"properties.col1","user_id" FROM column_data WHERE "Rank"=1 ORDER BY '
                '"user_id"'
            )
        )

    def test_get_segment_data_for_single_group(self):
        self.repo.execute_get_query = MagicMock()
        self.repo.get_segment_data(
            datasource_id=self.datasource_id,
            groups=self.groups[1:2],
            columns=self.columns,
        )
        calls = [
            call(
                parameters=self.params,
                query=(
                    "WITH column_data AS (SELECT "
                    f'"user_id","timestamp","properties.{column}",RANK() OVER(PARTITION BY '
                    '"user_id" ORDER BY "timestamp" DESC) AS "Rank" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND '
                    f'char_length(toString("properties.{column}"))>0 AND "user_id" IN (WITH '
                    'group0 AS (WITH cte0 AS (SELECT "user_id" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT '
                    '"user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s) AND '
                    "DATE(\"timestamp\")>='2022-01-01' AND "
                    "DATE(\"timestamp\")<='2023-01-01' AND \"event_name\"='Topic_Click' "
                    'GROUP BY "user_id" HAVING COUNT("user_id")=\'2\') ,cte1 AS (SELECT '
                    '"user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
                    '"user_id" IN (SELECT DISTINCT "user_id" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s) AND DATE("timestamp")>=\'2022-01-01\' '
                    "AND DATE(\"timestamp\")<='2023-01-01' AND "
                    '"event_name"<>\'Video_Open\') SELECT DISTINCT "cte0"."user_id" FROM '
                    'cte0 INTERSECT SELECT DISTINCT "cte1"."user_id" FROM cte1) SELECT '
                    'DISTINCT "group0"."user_id" FROM group0) ORDER BY "user_id") SELECT '
                    f'"properties.{column}","user_id" FROM column_data WHERE "Rank"=1 ORDER '
                    'BY "user_id"'
                ),
            )
            for column in self.columns
        ]

        self.repo.execute_get_query.assert_has_calls(calls=calls, any_order=True)

    def test_get_segment_data_for_multiple_groups(self):
        self.repo.execute_get_query = MagicMock()
        self.repo.get_segment_data(
            datasource_id=self.datasource_id,
            groups=self.groups,
            columns=self.columns,
        )
        calls = [
            call(
                parameters=self.params,
                query=(
                    "WITH column_data AS (SELECT "
                    f'"user_id","timestamp","properties.{column}",RANK() OVER(PARTITION BY '
                    '"user_id" ORDER BY "timestamp" DESC) AS "Rank" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND '
                    f'char_length(toString("properties.{column}"))>0 AND "user_id" IN (WITH '
                    'group0 AS (SELECT DISTINCT "user_id" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "properties.prop1" IN '
                    "('va1','val2') AND \"properties.prop2\" IN ('va3','val4')) "
                    ',group1 AS (WITH cte0 AS (SELECT "user_id" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT '
                    '"user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s) AND '
                    "DATE(\"timestamp\")>='2022-01-01' AND "
                    "DATE(\"timestamp\")<='2023-01-01' AND \"event_name\"='Topic_Click' "
                    'GROUP BY "user_id" HAVING COUNT("user_id")=\'2\') ,cte1 AS (SELECT '
                    '"user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
                    '"user_id" IN (SELECT DISTINCT "user_id" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s) AND DATE("timestamp")>=\'2022-01-01\' '
                    "AND DATE(\"timestamp\")<='2023-01-01' AND "
                    '"event_name"<>\'Video_Open\') SELECT DISTINCT "cte0"."user_id" FROM '
                    'cte0 INTERSECT SELECT DISTINCT "cte1"."user_id" FROM cte1) ,group2 '
                    'AS (WITH cte2 AS (SELECT "user_id" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "user_id" IN (SELECT DISTINCT '
                    '"user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
                    "\"properties.prop1\" IN ('va1','val2') AND \"properties.prop2\" IN "
                    "('va3','val4')) AND DATE(\"timestamp\")>='2022-01-01' AND "
                    "DATE(\"timestamp\")<='2023-01-01' AND \"event_name\"='Topic_Click' "
                    'GROUP BY "user_id" HAVING COUNT("user_id")=\'2\') ,cte3 AS (SELECT '
                    '"user_id" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
                    '"user_id" IN (SELECT DISTINCT "user_id" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "properties.prop1" IN '
                    "('va1','val2') AND \"properties.prop2\" IN ('va3','val4')) "
                    "AND DATE(\"timestamp\")>='2022-01-01' AND "
                    "DATE(\"timestamp\")<='2023-01-01' AND \"event_name\"<>'Video_Open') "
                    'SELECT DISTINCT "cte2"."user_id" FROM cte2 UNION ALL SELECT '
                    'DISTINCT "cte3"."user_id" FROM cte3) SELECT DISTINCT '
                    '"group0"."user_id" FROM group0 INTERSECT SELECT DISTINCT '
                    '"group1"."user_id" FROM group1 INTERSECT SELECT DISTINCT '
                    '"group2"."user_id" FROM group2) ORDER BY "user_id") SELECT '
                    f'"properties.{column}","user_id" FROM column_data WHERE "Rank"=1 ORDER '
                    'BY "user_id"'
                ),
            )
            for column in self.columns
        ]

        self.repo.execute_get_query.assert_has_calls(calls=calls, any_order=True)

    def test_build_segment_users_query_for_where_filters_select_all(self):
        assert self.repo.build_segment_users_query(
            groups=[
                SegmentGroup(
                    filters=self.where_select_all_filters,
                    condition=SegmentGroupConditions.AND,
                )
            ]
        ).get_sql() == (
            'WITH group0 AS (SELECT DISTINCT "user_id" FROM "events" WHERE '
            "\"datasource_id\"=%(ds_id)s AND \"properties.prop1\" IN ('va1','val2')) "
            'SELECT DISTINCT "group0"."user_id" FROM group0'
        )

    @pytest.mark.parametrize(
        "date_filter, date_filter_type, start_date, end_date",
        [
            (
                SegmentFixedDateFilter(start_date="2022-01-01", end_date="2023-01-01"),
                SegmentDateFilterType.FIXED,
                "2022-01-01",
                "2023-01-01",
            ),
            (
                SegmentSinceDateFilter(start_date="2022-01-01"),
                SegmentDateFilterType.SINCE,
                "2022-01-01",
                "2023-01-04",
            ),
            (
                SegmentLastDateFilter(days=10),
                SegmentDateFilterType.LAST,
                "2022-12-25",
                "2023-01-04",
            ),
        ],
    )
    def test_compute_date_filter(
        self, date_filter, date_filter_type, start_date, end_date, patch_datetime_today
    ):
        assert self.repo.compute_date_filter(
            date_filter=date_filter, date_filter_type=date_filter_type
        ) == (start_date, end_date)

    @pytest.mark.parametrize(
        "values, inverse, criteria",
        [
            ([1, 2, 3], True, "toFloat64OrNull(properties.prop1) NOT IN (1,2,3)"),
            ([2], False, "toFloat64OrNull(properties.prop1) IN (2)"),
        ],
    )
    def test_num_equality_criteria(self, values, inverse, criteria):
        assert (
            self.repo.num_equality_criteria(
                operand=self.convert_to_float_func(Field("properties.prop1")),
                values=values,
                inverse=inverse,
            ).get_sql()
            == criteria
        )

    @pytest.mark.parametrize(
        "value, operator, criteria",
        [
            (
                5,
                SegmentFilterOperatorsNumber.GT,
                'toFloat64OrNull("properties.prop1")>5',
            ),
            (
                10.0,
                SegmentFilterOperatorsNumber.LT,
                'toFloat64OrNull("properties.prop1")<10.0',
            ),
            (
                99,
                SegmentFilterOperatorsNumber.GE,
                'toFloat64OrNull("properties.prop1")>=99',
            ),
            (
                999,
                SegmentFilterOperatorsNumber.LE,
                'toFloat64OrNull("properties.prop1")<=999',
            ),
        ],
    )
    def test_num_comparative_criteria(self, value, operator, criteria):
        assert (
            self.repo.num_comparative_criteria(
                operand=self.convert_to_float_func(Field("properties.prop1")),
                value=value,
                operator=operator,
            ).get_sql()
            == criteria
        )

    @pytest.mark.parametrize(
        "inverse, criteria1, criteria2",
        [
            (
                True,
                'toFloat64OrNull("properties.prop1")>=10',
                'toFloat64OrNull("properties.prop1")<=5',
            ),
            (
                False,
                'toFloat64OrNull("properties.prop1")>=5',
                'toFloat64OrNull("properties.prop1")<=10',
            ),
        ],
    )
    def test_num_between_criteria(self, inverse, criteria1, criteria2):
        assert (
            self.repo.num_between_criteria(
                operand=self.convert_to_float_func(Field("properties.prop1")),
                inverse=inverse,
                values=[5, 10],
            )[0].get_sql()
            == criteria1
        )
        assert (
            self.repo.num_between_criteria(
                operand=self.convert_to_float_func(Field("properties.prop1")),
                inverse=inverse,
                values=[5, 10],
            )[1].get_sql()
            == criteria2
        )

    @pytest.mark.parametrize(
        "operator, criteria",
        [
            (SegmentFilterOperatorsBool.T, 'toBool("properties.prop1")=true'),
            (SegmentFilterOperatorsBool.F, 'toBool("properties.prop1")=false'),
        ],
    )
    def test_build_criterion_for_bool_filter(self, operator, criteria):
        bool_filter = WhereSegmentFilter(
            operator=operator,
            operand="prop1",
            values=[],
            all=False,
            type=SegmentFilterConditions.WHERE,
            condition=SegmentFilterConditions.WHERE,
            datatype=SegmentDataType.BOOL,
        )
        assert (
            self.repo.build_criterion_for_bool_filter(filter=bool_filter)[0].get_sql()
            == criteria
        )
        assert len(self.repo.build_criterion_for_bool_filter(filter=bool_filter)) == 1

    def test_build_criterion_for_number_filter(self):
        num_filter = WhereSegmentFilter(
            operator=SegmentFilterOperatorsNumber.NE,
            operand="prop1",
            values=[10],
            all=False,
            type=SegmentFilterConditions.WHERE,
            condition=SegmentFilterConditions.WHERE,
            datatype=SegmentDataType.NUMBER,
        )
        assert (
            self.repo.build_criterion_for_number_filter(filter=num_filter)[0].get_sql()
            == "toFloat64OrNull(properties.prop1) NOT IN (10)"
        )

    def test_build_criterion_for_string_filter(self):
        assert (
            self.repo.build_criterion_for_string_filter(filter=self.filters[0])[
                0
            ].get_sql()
            == "properties.prop1 IN ('va1','val2')"
        )
