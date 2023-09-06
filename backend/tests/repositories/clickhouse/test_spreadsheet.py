from unittest.mock import MagicMock

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
from repositories.clickhouse.parser.query_parser import QueryParser
from repositories.clickhouse.spreadsheet import Spreadsheets


class TestSpreadSheetRepository:
    def setup_method(self):
        self.spreadsheet_repo = Spreadsheets(
            clickhouse=MagicMock(), parser=QueryParser()
        )
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
            axisRange=None,
            rangeAxis=None,
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
            axisRange=None,
            rangeAxis=None,
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
            axisRange=[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ],
            rangeAxis=PivotAxisDetail(
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
            rowRange=[
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
            columnRange=[
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
