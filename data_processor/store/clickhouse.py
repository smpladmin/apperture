import os
from typing import Any, Dict, Iterable, Sequence

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

    def insert(
        self,
        table: str,
        data: Sequence[Sequence[Any]],
        column_names: Any,
    ):
        client = clickhouse_connect.get_client(
            host="clickhouse",
            allow_experimental_object_type=1,
            query_limit=0,
        )
        client.insert(table, data, column_names)
        client.close()
