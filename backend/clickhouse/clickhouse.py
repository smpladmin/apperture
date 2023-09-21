import os

import clickhouse_connect
from settings import apperture_settings

settings = apperture_settings()


class Clickhouse:
    def init(self):
        self.client = clickhouse_connect.get_client(
            host="clickhouse",
            allow_experimental_object_type=1,
            query_limit=0,
            max_execution_time=settings.clickhouse_max_execution_time_seconds,
        )
        self.admin = clickhouse_connect.get_client(
            host="clickhouse",
            allow_experimental_object_type=1,
            query_limit=0,
            username=os.getenv("CHDB_ADMIN_USERNAME", "clickhouse_admin"),
            password=os.getenv("CHDB_ADMIN_PASSWORD", "password"),
            max_execution_time=settings.clickhouse_max_execution_time_seconds,
        )

    def get_connection_for_user(self, username: str, password: str):
        return clickhouse_connect.get_client(
            host="clickhouse",
            allow_experimental_object_type=1,
            query_limit=0,
            username=username,
            password=password,
            max_execution_time=settings.clickhouse_max_execution_time_seconds,
        )

    def close(self):
        self.client.close()

    def close_admin(self):
        self.admin.close()
