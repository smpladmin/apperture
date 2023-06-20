from unittest.mock import MagicMock
from domain.spreadsheets.models import ColumnDefinition, ColumnDefinitionType, Formula
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
            ColumnDefinition(
                formula=Formula.UNIQUE,
                property="properties.utm_source",
                type=ColumnDefinitionType.DIMENSION,
            ),
            ColumnDefinition(
                formula=Formula.UNIQUE,
                property="properties.city",
                type=ColumnDefinitionType.DIMENSION,
            ),
            ColumnDefinition(
                formula=Formula.COUNT,
                property=None,
                type=ColumnDefinitionType.METRIC,
            ),
        ]

        query, props = self.spreadsheet_repo.build_transient_columns_query(
            datasource_id, columns
        )

        assert (
            query
            == """SELECT "properties.utm_source","properties.city",COUNT(*) FROM "events" WHERE "datasource_id"=%(ds_id)s GROUP BY 1,2"""
        )
        assert props == {"ds_id": datasource_id}

    def test_build_transient_columns_query_no_metrics(self):
        datasource_id = "test-ds-id"
        columns = [
            ColumnDefinition(
                formula=Formula.UNIQUE,
                property="properties.utm_source",
                type=ColumnDefinitionType.DIMENSION,
            ),
            ColumnDefinition(
                formula=Formula.UNIQUE,
                property="properties.city",
                type=ColumnDefinitionType.DIMENSION,
            ),
        ]

        query, props = self.spreadsheet_repo.build_transient_columns_query(
            datasource_id, columns
        )

        assert (
            query
            == """SELECT "properties.utm_source","properties.city" FROM "events" WHERE "datasource_id"=%(ds_id)s GROUP BY 1,2"""
        )
        assert props == {"ds_id": datasource_id}

    def test_build_transient_columns_query_no_dimension(self):
        datasource_id = "test-ds-id"
        columns = [
            ColumnDefinition(
                formula=Formula.COUNT,
                property=None,
                type=ColumnDefinitionType.METRIC,
            ),
            ColumnDefinition(
                formula=Formula.COUNT,
                property=None,
                type=ColumnDefinitionType.METRIC,
            ),
        ]

        query, props = self.spreadsheet_repo.build_transient_columns_query(
            datasource_id, columns
        )

        assert (
            query
            == """SELECT COUNT(*),COUNT(*) FROM "events" WHERE "datasource_id"=%(ds_id)s"""
        )
        assert props == {"ds_id": datasource_id}
