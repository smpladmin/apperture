import logging
from fastapi import Depends

from clickhouse.clickhouse import Clickhouse


class Role:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse

    def create_user(self, username: str, password: str):
        query = (
            f"CREATE USER {username} IDENTIFIED WITH plaintext_password BY '{password}'"
        )
        logging.info(f"User created with username: {username}")
        return self.clickhouse.admin.query(query=query)

    def grant_select_permission_to_user(self, username: str):
        query = f"GRANT SELECT ON events TO {username}"
        logging.info(f"Select permission granted to username: {username}")
        return self.clickhouse.admin.query(query=query)

    def create_row_policy(self, datasource_id: str, username: str):
        query = f"CREATE ROW POLICY pol{datasource_id} ON events USING datasource_id='{datasource_id}' TO {username}"
        logging.info(
            f"Row policy created for datasource_id: {datasource_id} to username: {username}"
        )
        return self.clickhouse.admin.query(query=query)
