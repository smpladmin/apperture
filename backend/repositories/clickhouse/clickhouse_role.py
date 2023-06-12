import logging

from fastapi import Depends

from clickhouse.clickhouse import Clickhouse


class ClickHouseRole:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse

    def create_user(self, username: str, password: str):
        query = (
            f"CREATE USER {username} IDENTIFIED WITH plaintext_password BY '{password}'"
        )
        logging.info(f"User created with username: {username}")
        return self.clickhouse.admin.query(query=query)

    def grant_select_permission_to_user(self, username: str):
        granted_tables = ["events", "clickstream"]
        for table in granted_tables:
            query = f"GRANT SELECT ON {table} TO {username};"
            self.clickhouse.admin.query(query=query)
            logging.info(
                f"Select permission granted to username: {username} on table: {table}"
            )

    def create_row_policy(self, datasource_id: str, username: str):
        query = f"CREATE ROW POLICY IF NOT EXISTS pol{datasource_id} ON default.events, default.clickstream USING datasource_id='{datasource_id}' TO {username}"
        logging.info(
            f"Row policy created for datasource_id: {datasource_id} to username: {username}"
        )
        return self.clickhouse.admin.query(query=query)
