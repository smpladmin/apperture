import re
from datetime import datetime
from typing import List, Union

from beanie import PydanticObjectId
from fastapi import Depends

from domain.apps.models import ClickHouseCredential
from domain.integrations.models import MySQLCredential, MsSQLCredential
from domain.spreadsheets.models import (
    ColumnType,
    ComputedSpreadsheet,
    DatabaseClient,
    DimensionDefinition,
    MetricDefinition,
    PivotAxisDetail,
    PivotValueDetail,
    Spreadsheet,
    SpreadSheetColumn,
    WorkBook,
)
from repositories.clickhouse.parser.query_parser import BusinessError
from repositories.clickhouse.parser.query_parser import QueryParser
from repositories.clickhouse.spreadsheet import Spreadsheets
from repositories.sql.mssql import MsSql
from repositories.sql.mysql import MySql


class SpreadsheetService:
    def __init__(
        self,
        spreadsheets: Spreadsheets = Depends(),
        mysql: MySql = Depends(),
        mssql: MsSql = Depends(),
        parser: QueryParser = Depends(),
    ):
        self.spreadsheets = spreadsheets
        self.mysql = mysql
        self.mssql = mssql
        self.parser = parser

    async def add_workbook(self, workbook: WorkBook):
        workbook.updated_at = workbook.created_at
        await WorkBook.insert(workbook)

    def build_workbook(
        self,
        name: str,
        datasource_id: PydanticObjectId,
        spreadsheets: List[Spreadsheet],
        app_id: PydanticObjectId,
        user_id: PydanticObjectId,
    ):
        return WorkBook(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            name=name,
            spreadsheets=spreadsheets,
        )

    async def get_workbooks_for_datasource_id(
        self, datasource_id: str
    ) -> List[WorkBook]:
        return await WorkBook.find(
            WorkBook.datasource_id == PydanticObjectId(datasource_id),
            WorkBook.enabled == True,
        ).to_list()

    async def get_workbooks_for_user_id(
        self, user_id: PydanticObjectId
    ) -> List[WorkBook]:
        return await WorkBook.find(
            WorkBook.user_id == user_id,
            WorkBook.enabled == True,
        ).to_list()

    async def get_workbooks_for_app(self, app_id: str) -> List[WorkBook]:
        return await WorkBook.find(
            WorkBook.app_id == PydanticObjectId(app_id),
            WorkBook.enabled == True,
        ).to_list()

    def cleanse_query_string(self, query_string: str) -> str:
        query_string = re.sub(r"--.*\n+", " ", query_string)
        return re.sub(r"\n+", " ", query_string).strip()

    async def get_transient_spreadsheets(
        self,
        query: str,
        credential: Union[ClickHouseCredential, MySQLCredential, MsSQLCredential],
        client: DatabaseClient = DatabaseClient.CLICKHOUSE,
    ) -> ComputedSpreadsheet:
        query = self.cleanse_query_string(query)
        query = self.parser.assign_query_limit(
            query_string=query, database_client=client
        )
        if client == DatabaseClient.CLICKHOUSE:
            result = self.spreadsheets.get_transient_spreadsheet(
                query=query,
                username=credential.username,
                password=credential.password,
            )
        elif client == DatabaseClient.MYSQL:
            result = self.mysql.connect_and_execute_query(
                query=query, credential=credential
            )
        elif client == DatabaseClient.MSSQL:
            result = self.mssql.connect_and_execute_query(
                query=query, credential=credential
            )

        response = {
            "headers": [
                SpreadSheetColumn(name=name, type=ColumnType.QUERY_HEADER)
                for name in result.column_names
            ],
            "data": [],
        }

        for idx, row in enumerate(result.result_set):
            row_data = {"index": idx + 1}
            for col_idx, column_name in enumerate(result.column_names):
                row_data[column_name] = row[col_idx]
            response["data"].append(row_data)

        return ComputedSpreadsheet(
            data=response["data"], headers=response["headers"], sql=query
        )

    async def get_workbook_by_id(self, workbook_id: str):
        return await WorkBook.find_one(WorkBook.id == PydanticObjectId(workbook_id))

    async def delete_workbook(self, workbook_id: str):
        await WorkBook.find_one(
            WorkBook.id == PydanticObjectId(workbook_id),
        ).update({"$set": {"enabled": False}})
        return

    async def update_workbook(self, workbook_id: str, workbook: WorkBook):
        entry = workbook.dict()
        entry.pop("id")
        entry.pop("created_at")
        entry["updated_at"] = datetime.utcnow()

        await WorkBook.find_one(
            WorkBook.id == PydanticObjectId(workbook_id),
        ).update({"$set": entry})

    def get_transient_columns(
        self,
        datasource_id: str,
        dimensions: List[DimensionDefinition],
        metrics: List[MetricDefinition],
        database: str,
        table: str,
        clickhouse_credentials: ClickHouseCredential,
    ):
        result = self.spreadsheets.get_transient_columns(
            datasource_id, dimensions, metrics, database, table, clickhouse_credentials
        )

        response = {
            "headers": [
                SpreadSheetColumn(name=name, type=ColumnType.COMPUTED_HEADER)
                for name in result.column_names
            ],
            "data": [],
        }

        for idx, row in enumerate(result.result_set):
            row_data = {"index": idx + 1}
            for col_idx, column_name in enumerate(result.column_names):
                row_data[column_name] = row[col_idx]
            response["data"].append(row_data)

        return ComputedSpreadsheet(
            data=response["data"], headers=response["headers"], sql=""
        )

    def compute_transient_expression(
        self,
        username: str,
        password: str,
        expressions: List[str],
        variables: dict,
        table: str,
        database: str,
    ):
        result = self.spreadsheets.compute_transient_expression(
            username=username,
            password=password,
            expressions=expressions,
            variables=variables,
            table=table,
            database=database,
        )
        return result.result_set

    def get_ordered_distinct_values(self, query, values, **kwargs):
        return self.spreadsheets.compute_ordered_distinct_values(
            reference_query=query,
            values=values,
            **kwargs,
        )

    def compute_transient_pivot(self, sql, rows, columns, values, **kwargs):
        return self.spreadsheets.compute_transient_pivot(
            sql=sql,
            rows=rows,
            columns=columns,
            values=values,
            **kwargs,
        )

    def populate_data(self, data, result_set):
        for result in result_set:
            if not data.get(result[0]):
                data[result[0]] = {}
            data[result[0]][result[1]] = result[2]
        return data

    def populate_row_totals(self, data, unique_rows, key):
        for row in unique_rows:
            if not data.get(row[0]):
                data[row[0]] = {}
            data[row[0]][key] = row[1]
        return data

    def populate_column_totals(self, data, unique_columns, key):
        for column in unique_columns:
            if not data.get(key):
                data[key] = {}
            data[key][column[0]] = column[1]
        return data

    def compute_pivot(
        self,
        query: str,
        rows: List[PivotAxisDetail],
        columns: List[PivotAxisDetail],
        values: List[PivotValueDetail],
    ):
        data = {}
        unique_columns, unique_rows = None, None
        column_names, row_names = [], []

        if rows:
            unique_rows = self.get_ordered_distinct_values(
                query,
                rows,
                aggregate=values[0] if values else None,
                show_total=rows[0].show_total or (not columns and values),
            )
            row_names = [row[0] for row in unique_rows]

        if columns:
            unique_columns = self.get_ordered_distinct_values(
                query,
                columns,
                aggregate=values[0] if values else None,
                axis_range=row_names,
                range_axis=rows[0] if rows else None,
                show_total=columns[0].show_total or (not rows and values),
                limit=24,
            )
            column_names = [column[0] for column in unique_columns]

        if rows and columns and values:
            try:
                result_set = self.compute_transient_pivot(
                    query,
                    rows,
                    columns,
                    values,
                    row_range=row_names,
                    column_range=column_names,
                )
                data = self.populate_data(data, result_set)
            except Exception as e:
                raise BusinessError("Could not generate pivot table, invalid values")

        if rows and (rows[0].show_total or (not columns and values)):
            key = f"SUM of {values[0].name}" if (not columns and values) else "Total"
            data = self.populate_row_totals(data, unique_rows, key)
            column_names.append(key)

        if columns and (columns[0].show_total or (not rows and values)):
            key = f"SUM of {values[0].name}" if (not rows and values) else "Total"
            data = self.populate_column_totals(data, unique_columns, key)
            row_names.append(key)

        return {
            "rows": row_names,
            "columns": column_names,
            "data": data,
        }

    async def compute_vlookup(
        self,
        credential: ClickHouseCredential,
        search_query: str,
        lookup_query: str,
        search_column: str,
        lookup_column: str,
        lookup_index_column: str,
    ):
        search_query = self.cleanse_query_string(search_query)
        search_query = self.parser.assign_query_limit(search_query)
        lookup_query = self.cleanse_query_string(lookup_query)
        result = self.spreadsheets.get_vlookup(
            search_query=search_query,
            lookup_query=lookup_query,
            search_column=search_column,
            lookup_column=lookup_column,
            username=credential.username,
            password=credential.password,
            lookup_index_column=lookup_index_column,
        )
        return result
