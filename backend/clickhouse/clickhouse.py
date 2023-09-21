import os

import clickhouse_connect


class Clickhouse:
    def init(self):
        self.client = clickhouse_connect.get_client(
            host="clickhouse",
            allow_experimental_object_type=1,
            query_limit=0,
            max_execution_time=120,
        )
        self.admin = clickhouse_connect.get_client(
            host="clickhouse",
            allow_experimental_object_type=1,
            query_limit=0,
            username=os.getenv("CHDB_ADMIN_USERNAME", "clickhouse_admin"),
            password=os.getenv("CHDB_ADMIN_PASSWORD", "password"),
            max_execution_time=120,
        )

    def get_connection_for_user(self, username: str, password: str):
        return clickhouse_connect.get_client(
            host="clickhouse",
            allow_experimental_object_type=1,
            query_limit=0,
            username=username,
            password=password,
            max_execution_time=120,
        )

    def close(self):
        self.client.close()

    def close_admin(self):
        self.admin.close()
