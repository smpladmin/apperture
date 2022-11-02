import clickhouse_driver


class Clickhouse:
    def __init__(self):
        self.client = clickhouse_driver.Client(host='clickhouse')

    def close(self):
        self.client.disconnect()
