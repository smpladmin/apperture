from fastapi import Depends
from clickhouse.clickhouse import Clickhouse

from repositories.clickhouse.base import EventsBase


class Role(EventsBase):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse

    def create_user(self, username: str, password: str):
        query = (
            f"Create user {username} IDENTIFIED WITH plaintext_password BY {password}"
        )
        return self.execute_get_query(query=query, parameters={})

    def grant_select_permission_to_user(self, username: str):
        query = f"Grant Select on events to {username}"
        return self.execute_get_query(query=query, parameters={})

    def create_row_policy(self, datasource_id: str, username: str):
        query = f"CREATE ROW POLICY pol{datasource_id} ON events USING datasource_id={datasource_id} TO {username}"
        return self.execute_get_query(query=query, parameters={})
