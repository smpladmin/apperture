from unittest.mock import MagicMock

from clickhouse_connect.driver.query import QueryResult

from domain.spreadsheets.models import (
    AggregateFunction,
    ColumnFilter,
    ColumnFilterOperators,
    DimensionDefinition,
    Formula,
    MetricDefinition,
    PivotAxisDetail,
    PivotValueDetail,
    SortingOrder,
)
from repositories.clickhouse.spreadsheet import Spreadsheets


class TestSpreadSheetRepository:
    def setup_method(self):
        self.spreadsheet_repo = Spreadsheets(clickhouse=MagicMock())
        self.pivot_axis_row_with_total = PivotAxisDetail(
            name="user_id",
            sort_by="user_id",
            order_by=SortingOrder.ASC,
            show_total=True,
        )
        self.pivot_axis_row_without_total = PivotAxisDetail(
            name="user_id",
            sort_by="user_id",
            order_by=SortingOrder.ASC,
            show_total=False,
        )
        self.pivot_axis_column_without_total = PivotAxisDetail(
            name="weekday",
            sort_by="weekday",
            order_by=SortingOrder.ASC,
            show_total=False,
        )
        self.pivot_axis_value = PivotValueDetail(
            name="salary", function=AggregateFunction.SUM
        )
        self.pivot_axis_value_count = PivotValueDetail(
            name="salary", function=AggregateFunction.COUNT
        )

    def test_build_transient_columns_query(self):
        datasource_id = "test-ds-id"
        columns = [
            DimensionDefinition(
                formula=Formula.UNIQUE,
                property="properties.utm_source",
            ),
            DimensionDefinition(
                formula=Formula.UNIQUE,
                property="properties.city",
            ),
        ]

        query, props = self.spreadsheet_repo.build_transient_columns_query(
            datasource_id,
            columns,
            [
                MetricDefinition(
                    formula=Formula.COUNTIF,
                    filters=[
                        ColumnFilter(
                            operator=ColumnFilterOperators.GREATER_THAN,
                            operand="property.property.amount",
                            value=[1000000],
                        ),
                    ],
                ),
            ],
            "default",
            "events",
        )

        assert (
            query
            == """SELECT "properties.utm_source","properties.city",COUNT(CASE WHEN "property.property.amount">1000000 THEN 1 END) FROM "default"."events" GROUP BY 1,2 LIMIT 1000"""
        )
        assert props == {"ds_id": datasource_id}

    def test_build_transient_columns_query_no_metrics(self):
        datasource_id = "test-ds-id"
        columns = [
            DimensionDefinition(
                formula=Formula.UNIQUE,
                property="properties.utm_source",
            ),
            DimensionDefinition(
                formula=Formula.UNIQUE,
                property="properties.city",
            ),
        ]

        query, props = self.spreadsheet_repo.build_transient_columns_query(
            datasource_id, columns, [], "default", "events"
        )

        assert (
            query
            == """SELECT "properties.utm_source","properties.city" FROM "default"."events" GROUP BY 1,2 LIMIT 1000"""
        )
        assert props == {"ds_id": datasource_id}

    def test_build_transient_columns_query_no_dimension(self):
        datasource_id = "test-ds-id"

        query, props = self.spreadsheet_repo.build_transient_columns_query(
            datasource_id,
            [],
            [
                MetricDefinition(
                    formula=Formula.COUNT,
                ),
            ],
            "default",
            "events",
        )

        assert query == """SELECT COUNT(*) FROM "default"."events" LIMIT 1000"""
        assert props == {"ds_id": datasource_id}

    def test_build_transient_columns_query_with_countif_single(self):
        datasource_id = "test-ds-id"

        query, props = self.spreadsheet_repo.build_transient_columns_query(
            datasource_id,
            [],
            [
                MetricDefinition(
                    formula=Formula.COUNTIF,
                    filters=[
                        ColumnFilter(
                            operator=ColumnFilterOperators.GREATER_THAN,
                            operand="property.property.amount",
                            value=[1000000],
                        ),
                    ],
                ),
            ],
            "default",
            "events",
        )

        assert (
            query
            == """SELECT COUNT(CASE WHEN "property.property.amount">1000000 THEN 1 END) FROM "default"."events" LIMIT 1000"""
        )
        assert props == {"ds_id": datasource_id}

    def test_build_transient_columns_query_with_countif_multiple(self):
        datasource_id = "test-ds-id"

        query, props = self.spreadsheet_repo.build_transient_columns_query(
            datasource_id,
            [],
            [
                MetricDefinition(
                    formula=Formula.COUNTIF,
                    filters=[
                        ColumnFilter(
                            operator=ColumnFilterOperators.EQUALS,
                            operand="property.property.city",
                            value=["Bangalore"],
                        ),
                        ColumnFilter(
                            operator=ColumnFilterOperators.IN,
                            operand="property.property.device",
                            value=["Android", "iPhone"],
                        ),
                    ],
                ),
            ],
            "default",
            "events",
        )

        assert (
            query
            == """SELECT COUNT(CASE WHEN "property.property.city"='Bangalore' AND "property.property.device" IN ('Android','iPhone') THEN 1 END) FROM "default"."events" LIMIT 1000"""
        )
        assert props == {"ds_id": datasource_id}

    def test_compute_ordered_distinct_values_no_total(self):
        result = self.spreadsheet_repo.build_compute_ordered_distinct_values(
            reference_query="SELECT * FROM events",
            values=[self.pivot_axis_row_without_total],
            aggregate=self.pivot_axis_value,
            show_total=False,
            axis_range=None,
            range_axis=None,
            limit=50,
        )

        assert (
            result
            == 'SELECT "user_id" FROM (SELECT * FROM events) GROUP BY "user_id" ORDER BY "user_id" ASC LIMIT 50'
        )

    def test_compute_ordered_distinct_values_with_total(self):
        result = self.spreadsheet_repo.build_compute_ordered_distinct_values(
            reference_query="SELECT * FROM table",
            values=[self.pivot_axis_row_without_total],
            aggregate=self.pivot_axis_value,
            show_total=True,
            axis_range=None,
            range_axis=None,
            limit=50,
        )

        assert (
            result
            == 'SELECT "user_id",SUM("salary") FROM (SELECT * FROM table) GROUP BY "user_id" ORDER BY "user_id" ASC LIMIT 50'
        )

    def test_compute_ordered_distinct_values_with_total_and_range(self):
        result = self.spreadsheet_repo.build_compute_ordered_distinct_values(
            reference_query="SELECT * FROM table",
            values=[self.pivot_axis_row_without_total],
            aggregate=self.pivot_axis_value,
            show_total=True,
            axis_range=[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ],
            range_axis=PivotAxisDetail(
                name="weekday",
                sort_by="weekday",
                order_by=SortingOrder.ASC,
                show_total=True,
            ),
            limit=50,
        )

        assert (
            result
            == "SELECT \"user_id\",SUM(\"salary\") FROM (SELECT * FROM table) WHERE \"weekday\" IN ('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') GROUP BY \"user_id\" ORDER BY \"user_id\" ASC LIMIT 50"
        )

    def test_build_compute_ordered_distinct_values(self):
        result = self.spreadsheet_repo.build_compute_transient_pivot(
            sql="SELECT * FROM table",
            rows=[self.pivot_axis_row_with_total],
            columns=[self.pivot_axis_column_without_total],
            values=[self.pivot_axis_value],
            row_range=[
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
            ],
            column_range=[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ],
        )

        assert (
            result
            == 'SELECT "user_id","weekday",SUM("salary") FROM (SELECT * FROM table) WHERE "user_id" IN (1,2,3,4,5,6,7,8,9,10) AND "weekday" IN (\'Sunday\',\'Monday\',\'Tuesday\',\'Wednesday\',\'Thursday\',\'Friday\',\'Saturday\') GROUP BY "user_id","weekday" ORDER BY "user_id" ASC,"weekday" ASC'
        )

    def test_build_compute_ordered_distinct_values_for_count(self):
        result = self.spreadsheet_repo.build_compute_transient_pivot(
            sql="SELECT * FROM table",
            rows=[self.pivot_axis_row_with_total],
            columns=[self.pivot_axis_column_without_total],
            values=[self.pivot_axis_value_count],
            row_range=[
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
            ],
            column_range=[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ],
        )

        assert (
            result
            == 'SELECT "user_id","weekday",COUNT("salary") FROM (SELECT * FROM table) WHERE "user_id" IN (1,2,3,4,5,6,7,8,9,10) AND "weekday" IN (\'Sunday\',\'Monday\',\'Tuesday\',\'Wednesday\',\'Thursday\',\'Friday\',\'Saturday\') GROUP BY "user_id","weekday" ORDER BY "user_id" ASC,"weekday" ASC'
        )

    def test_get_vlookup(self):
        self.spreadsheet_repo.execute_query_for_restricted_client = MagicMock(
            return_value=QueryResult(
                result_set=[
                    ["test1"],
                    ["test2"],
                ],
                column_names=("1", "2"),
                column_types=(),
            )
        )
        assert self.spreadsheet_repo.get_vlookup(
            search_query="select event_name, user_id from default.events where datasource_id = '64c8bd3fc190a9e2973469bd'",
            lookup_query="select event_name, user_id from default.events where datasource_id = '64c8bd3fc190a9e2973469bd'",
            search_column="event_name",
            lookup_column="user_id",
            lookup_index_column="event_name",
            username="test-user",
            password="test-password",
        ) == ["test1", "test2"]

    def test_build_vlookup_query(self):
        assert self.spreadsheet_repo.build_vlookup_query(
            search_query="select event_name, user_id from default.events where datasource_id = '64c8bd3fc190a9e2973469bd'",
            lookup_query="select event_name, user_id from default.events where datasource_id = '64c8bd3fc190a9e2973469bd'",
            search_column="event_name",
            lookup_column="user_id",
            lookup_index_column="event_name",
        ) == (
            "with lookup_query as (select event_name, user_id from default.events where datasource_id = '64c8bd3fc190a9e2973469bd'), map as (SELECT DISTINCT ON (event_name) event_name, user_id AS lookup_column FROM lookup_query ORDER BY event_name), cte as (select event_name, user_id from default.events where datasource_id = '64c8bd3fc190a9e2973469bd') select lookup_column from cte left join map on cte.event_name = map.event_name"
        )
