import pymssql
import clickhouse_connect
import pandas as pd
from datetime import datetime


class MSSQLClient:
    def __init__(self, server, database, username, password):
        self.server = server
        self.database = database
        self.username = username
        self.password = password

    def create_connection(self):
        return pymssql.connect(
            host=self.server,
            database=self.database,
            user=self.username,
            password=self.password,
        )

    def query(self, query):
        conn = self.create_connection()
        cur = conn.cursor()
        cur.execute(query)
        data = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        df = pd.DataFrame(data, columns=columns)
        df = df.fillna("").drop_duplicates()
        return df


class ClickHouseClient:
    def __init__(self, host, port, username, password, database):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.database = database
        self.client = clickhouse_connect.get_client(
            host=self.host,
            port=self.port,
            username=self.username,
            password=self.password,
            database=self.database,
        )

    def query(self, query):
        try:
            print(query)
            result = self.client.query(query)
            print(f"Query Result: {result}")
            data = result.result_set
            columns = result.column_names
            df = pd.DataFrame(data, columns=columns)
            return df
        except Exception as e:
            print(f"An error occurred: {e}")
            return None
