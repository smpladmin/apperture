import os

import clickhouse_connect


class Clickhouse:
    def init(self):
        self.client = clickhouse_connect.get_client(
            host="clickhouse",
            allow_experimental_object_type=1,
            query_limit=0,
        )

    def close(self):
        self.client.close()

    def close_admin(self):
        self.admin.close()
