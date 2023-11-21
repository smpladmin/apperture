import logging
import os
import re
from datetime import datetime

from fastapi import Depends

from clickhouse import Clickhouse
from domain.apps.models import ClickHouseCredential
from domain.integrations.models import MsSQLCredential
from repositories.clickhouse.base import EventsBase
from repositories.sql.mssql import MsSql


class DataMartRepo(EventsBase):
    def __init__(
        self,
        clickhouse: Clickhouse = Depends(),
        mssql_client: MsSql = Depends(),
    ):
        super().__init__(clickhouse=clickhouse)
        self.DUMMY_COLUMN = "dummy_column_for_orderby"
        self.logger = logging.getLogger(name=__name__)
        self.mssql_client = mssql_client
        self.chunk_size = int(os.getenv("CLICKHOUSE_INSERT_CHUNK_SIZE", 10000))

    def cleanse_query_string(self, query_string: str) -> str:
        query_string = re.sub(r"--.*\n+", " ", query_string)
        return re.sub(r"\n+", " ", query_string).strip()

    def generate_create_table_query(self, query: str, table_name: str, db_name: str):
        create_query = f"CREATE TABLE {db_name}.{table_name}  ENGINE = MergeTree ORDER BY tuple() AS {query}"
        return create_query

    async def create_table(
        self,
        query: str,
        table_name: str,
        clickhouse_credential: ClickHouseCredential,
        app_id: str,
    ) -> bool:
        query = self.cleanse_query_string(query_string=query)
        await self.execute_query_for_app_restricted_clients(
            query=f"DROP TABLE IF EXISTS {clickhouse_credential.databasename}.{table_name}",
            app_id=app_id,
        )
        create_table_query = self.generate_create_table_query(
            query=query,
            table_name=table_name,
            db_name=clickhouse_credential.databasename,
        )
        self.logger.info(f"Executing create table query: {create_table_query}")
        result = await self.execute_query_for_app_restricted_clients(
            query=create_table_query, app_id=app_id
        )
        if result:
            self.logger.info(
                f"Created a clickhouse table {table_name} in {clickhouse_credential.databasename} database for user {clickhouse_credential.username}"
            )
            return True
        return False

    def limit_query(self, query_string: str):
        pattern = r"(?i)\bTOP\s*\(\s*\d+\s*\)"
        if not re.search(pattern, query_string):
            query_string = re.sub(
                r"(?i)\bSELECT\b", "SELECT TOP(2000)", query_string, count=1
            )
        return query_string

    def format_datetime(self, value):
        if isinstance(value, datetime):
            return f"'{value.strftime('%Y-%m-%d %H:%M:%S')}'"
        elif isinstance(value, str):
            value = value.replace("'", "''")
            return f"'{value}'"
        elif value == None:
            return "NULL"
        return str(value)

    async def create_mssql_table(
        self,
        query: str,
        table_name: str,
        app_id: str,
        clickhouse_credential: ClickHouseCredential,
        db_creds: MsSQLCredential,
    ):
        query = self.cleanse_query_string(query_string=query)
        query = self.limit_query(query_string=query)
        await self.execute_query_for_app_restricted_clients(
            query=f"DROP TABLE IF EXISTS {clickhouse_credential.databasename}.{table_name}",
            app_id=app_id,
        )
        mssql_clickhouse_datatype_map = {
            1: "String",
            2: "Binary",
            3: "Int32",
            4: "DateTime",
            5: "Int32",
        }

        connection = self.mssql_client.get_connection(
            host=db_creds.server,
            username=db_creds.username,
            password=db_creds.password,
        )
        cursor = connection.cursor()
        cursor.execute(query)
        column_names = [i[0] for i in cursor.description]
        column_types = [
            mssql_clickhouse_datatype_map[desc[1]] for desc in cursor.description
        ]

        # Build the CREATE TABLE query
        create_table_query = f"CREATE TABLE IF NOT EXISTS {clickhouse_credential.databasename}.{table_name} ("

        for name, data_type in zip(column_names, column_types):
            create_table_query += f"{name} {data_type}, "

        create_table_query = (
            create_table_query.rstrip(", ") + ") ENGINE = MergeTree() ORDER BY tuple();"
        )
        self.logger.info(f"Executing create table query: {create_table_query}")
        create_status = await self.execute_query_for_app_restricted_clients(
            query=create_table_query, app_id=app_id
        )
        if create_status:
            self.logger.info(
                f"Created a clickhouse table {table_name} in {clickhouse_credential.databasename} database for user {clickhouse_credential.username}"
            )
        else:
            self.logger.info("Create table query failed")
            return False

        while True:
            rows = cursor.fetchmany(size=self.chunk_size)
            if not rows:
                break

            # Build the INSERT INTO query
            insert_query = (
                f"INSERT INTO {clickhouse_credential.databasename}.{table_name} VALUES"
            )
            for row in rows:
                formatted_values = ", ".join(map(self.format_datetime, row))
                insert_query += f" ({formatted_values}),"

            insert_query = insert_query.rstrip(",")
            self.logger.info(
                f"Executing insert into table query for {self.chunk_size} rows: {insert_query}"
            )
            insert_status = await self.execute_query_for_app_restricted_clients(
                query=insert_query,
                app_id=app_id,
            )
            if insert_status:
                self.logger.info(f"Successfully inserted data into the table")
            else:
                self.logger.info("Insert into table query failed")
                return False

        return True

    async def drop_table(
        self, table_name: str, clickhouse_credential: ClickHouseCredential, app_id: str
    ):
        query = (
            f"DROP TABLE IF EXISTS {clickhouse_credential.databasename}.{table_name}"
        )
        self.logger.info(f"Executing drop table query: {query}")
        result = await self.execute_query_for_app_restricted_clients(
            query=query,
            app_id=app_id,
        )
        self.logger.info(
            f"Dropped a clickhouse table {table_name} from {clickhouse_credential.databasename} database for user {clickhouse_credential.username}"
        )
