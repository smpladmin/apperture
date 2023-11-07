import logging
from typing import List

from fastapi import Depends

from clickhouse.clickhouse import Clickhouse
from clickhouse.clickhouse_client_factory import ClickHouseClientFactory


class ClickHouseRole:
    async def create_user(self, username: str, password: str, app_id: str):
        query = (
            f"CREATE USER {username} IDENTIFIED WITH sha256_password BY '{password}'"
        )
        client = await ClickHouseClientFactory.get_client(app_id)
        logging.info(f"###client {client.app}")
        return client.admin_query(query=query)

    async def grant_select_permission_to_user(self, username: str, app_id: str):
        granted_tables = ["events", "clickstream"]
        client = await ClickHouseClientFactory.get_client(app_id)
        for table in granted_tables:
            query = f"GRANT SELECT ON {table} TO {username};"
            client.admin_query(query=query)

    async def create_row_policy(self, datasource_id: str, username: str, app_id: str):
        query = f"CREATE ROW POLICY pol{datasource_id} ON default.events, default.clickstream USING datasource_id='{datasource_id}' TO {username}"
        client = await ClickHouseClientFactory.get_client(app_id)
        try:
            return client.admin_query(query=query)
        except Exception as e:
            client.admin_query(
                query=f"DROP POLICY IF EXISTS pol{datasource_id} ON default.events, default.clickstream"
            )
            return client.admin_query(query=query)

    async def grant_permission_to_database(
        self, database_name: str, username: str, app_id: str
    ):
        query = f"GRANT SHOW, SELECT, INSERT, ALTER, CREATE TABLE, CREATE VIEW, DROP TABLE, DROP VIEW, UNDROP TABLE, TRUNCATE ON {database_name}.* TO {username};"
        client = await ClickHouseClientFactory.get_client(app_id)

        return client.admin_query(query=query)

    async def create_database_for_app(self, database_name: str, app_id: str):
        query = f"CREATE DATABASE {database_name}"
        client = await ClickHouseClientFactory.get_client(app_id)
        return client.admin_query(query=query)

    async def create_sample_tables(
        self, table_names: List[str], database_name: str, app_id: str
    ):
        client = await ClickHouseClientFactory.get_client(app_id)

        for table in table_names:
            create_query = f"CREATE TABLE {database_name}.{table} ENGINE = MergeTree() ORDER BY tuple() AS SELECT * FROM default.{table}"
            logging.info(f"sample table query: {create_query}")
            client.admin_query(query=create_query)
