import re
from datetime import datetime
from typing import List, Union

from beanie import PydanticObjectId
from fastapi import Depends

from domain.apps.models import ClickHouseCredential
from domain.integrations.models import MySQLCredential
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
from repositories.clickhouse.spreadsheet import Spreadsheets
from repositories.mysql.mysql import MySql


class SpreadsheetService:
    def __init__(
        self, spreadsheets: Spreadsheets = Depends(), mysql: MySql = Depends()
    ):
        self.spreadsheets = spreadsheets
        self.mysql = mysql

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
        credential: Union[ClickHouseCredential, MySQLCredential],
        client: DatabaseClient = DatabaseClient.CLICKHOUSE,
    ) -> ComputedSpreadsheet:
        query = self.cleanse_query_string(query)
        result = (
            self.spreadsheets.get_transient_spreadsheet(
                query=query,
                username=credential.username,
                password=credential.password,
            )
            if client == DatabaseClient.CLICKHOUSE
            else self.mysql.execute_mysql_query(query=query, credential=credential)
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

    def compute_pivot(
        self,
        query: str,
        rows: List[PivotAxisDetail],
        columns: List[PivotAxisDetail],
        values: List[PivotValueDetail],
        username,
        password,
    ):
        data = {}

        distinct_columns, distinct_rows = None, None

        if rows:
            distinct_rows = self.spreadsheets.compute_ordered_distinct_values(
                reference_query=query,
                values=rows,
                username=username,
                password=password,
                aggregate=values[0],
            )
            row_names = [row[0] for row in distinct_rows]
            if rows[0].show_total:
                for row in distinct_rows:
                    if not data.get(row[0]):
                        data[row[0]] = {}
                    data[row[0]]["Total"] = row[1]
        if columns:
            distinct_columns = self.spreadsheets.compute_ordered_distinct_values(
                reference_query=query,
                values=columns,
                username=username,
                password=password,
                aggregate=values[0],
                axisRange=row_names,
                rangeAxis=rows[0],
            )
            column_names = [column[0] for column in distinct_columns]
            if columns[0].show_total:
                for column in distinct_columns:
                    if not data.get("Total"):
                        data["Total"] = {}
                    data["Total"][column[0]] = column[1]

        if rows and columns and values:
            result_set = self.spreadsheets.compute_transient_pivot(
                sql=query,
                rows=rows,
                columns=columns,
                values=values,
                username=username,
                password=password,
                rowRange=row_names,
            )
            for result in result_set:
                if not data.get(result[0]):
                    data[result[0]] = {}
                data[result[0]][result[1]] = result[2]

        if rows and rows[0].show_total:
            column_names.append("Total")
        if columns and columns[0].show_total:
            row_names.append("Total")

        return {
            "rows": row_names if distinct_rows else [],
            "columns": column_names if distinct_columns else [],
            "data": data,
        }
