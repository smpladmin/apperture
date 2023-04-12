import clickhouse_connect


class Clickhouse:
    def init(self):
        self.client = clickhouse_connect.get_client(
            host="clickhouse",
            query_limit=0,
        )

    def close(self):
        self.client.close()
