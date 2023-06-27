from unittest.mock import MagicMock

from domain.spreadsheets.models import (
    ColumnFilter,
    ColumnFilterOperators,
    DimensionDefinition,
    Formula,
    MetricDefinition,
)
from repositories.clickhouse.parser.query_parser import QueryParser
from repositories.clickhouse.spreadsheet import Spreadsheets


class TestSpreadSheetRepository:
    def setup_method(self):
        self.spreadsheet_repo = Spreadsheets(
            clickhouse=MagicMock(), parser=QueryParser()
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
        )

        assert (
            query
            == """SELECT "properties.utm_source","properties.city",COUNT(CASE WHEN "property.property.amount">1000000 THEN 1 END) FROM "events" WHERE "datasource_id"=%(ds_id)s GROUP BY 1,2"""
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
            datasource_id, columns, []
        )

        assert (
            query
            == """SELECT "properties.utm_source","properties.city" FROM "events" WHERE "datasource_id"=%(ds_id)s GROUP BY 1,2"""
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
        )

        assert (
            query == """SELECT COUNT(*) FROM "events" WHERE "datasource_id"=%(ds_id)s"""
        )
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
        )

        assert (
            query
            == """SELECT COUNT(CASE WHEN "property.property.amount">1000000 THEN 1 END) FROM "events" WHERE "datasource_id"=%(ds_id)s"""
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
        )

        assert (
            query
            == """SELECT COUNT(CASE WHEN "property.property.city"='Bangalore' AND "property.property.device" IN ('Android','iPhone') THEN 1 END) FROM "events" WHERE "datasource_id"=%(ds_id)s"""
        )
        assert props == {"ds_id": datasource_id}
