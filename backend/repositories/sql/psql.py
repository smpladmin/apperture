import psycopg2
from typing import List
from repositories.sql.base import SQLBase


class PSql(SQLBase):
    def get_connection(self, host, port, username, password, database=None):
        return psycopg2.connect(
            host=host,
            port=int(port),
            user=username,
            password=password,
            dbname=database,
        )

    def get_tables(self, connection, database: str) -> List[str]:
        cursor = connection.cursor()
        cursor.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema = 'public';"
        )
        results = cursor.fetchall()
        return [result[0] for result in results]

    def get_cdc_tables(self, connection, database: str) -> List[str]:
        return self.get_tables(connection=connection, database=database)

    def get_table_description(self, connection, table_name: str, database: str):
        """
        @param connection:
        @param table_name:
        @param database:
        @return: List of lists containing column_name, datatype and nullable.
        """
        cursor = connection.cursor()
        cursor.execute(
            f"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '{table_name}';"
        )
        results = cursor.fetchall()
        return [[result[0], result[1], result[2] == "YES"] for result in results]

    def connect_and_execute_query(self, query: str, credential):
        pass

    def get_dbs(self, connection) -> List[str]:
        pass

    def get_table_columns(self, connection, table_name: str) -> List[str]:
        pass
