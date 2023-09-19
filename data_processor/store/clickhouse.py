import os
from typing import Any, Dict, Iterable, Sequence

import clickhouse_connect


class Clickhouse:
    def __init__(self):
        try:
            self.client = clickhouse_connect.get_client(
                host="clickhouse",
                allow_experimental_object_type=1,
                query_limit=0,
            )
        except:
            self.client = None

    def close(self):
        self.client.close()

    def __del__(self):
        if self.client:
            self.client.close()
