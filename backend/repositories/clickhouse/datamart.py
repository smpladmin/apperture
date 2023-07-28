import re
import logging

from fastapi import Depends

from clickhouse import Clickhouse
from domain.apps.models import ClickHouseCredential
from repositories.clickhouse.base import EventsBase


class DataMartRepo(EventsBase):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        super().__init__(clickhouse=clickhouse)
        self.DUMMY_COLUMN = "dummy_column_for_orderby"
        self.logger = logging.getLogger(name=__name__)

    def cleanse_query_string(self, query_string: str) -> str:
        query_string = re.sub(r"--.*\n+", " ", query_string)
        return re.sub(r"\n+", " ", query_string).strip()

    def generate_create_table_query(self, query: str, table_name: str, db_name: str):
        create_query = f"CREATE TABLE {db_name}.{table_name}  ENGINE = MergeTree ORDER BY tuple() AS {query}"
        return create_query

    def create_table(
        self, query: str, table_name: str, clickhouse_credential: ClickHouseCredential
    ):
        query = self.cleanse_query_string(query_string=query)
        self.execute_query_for_restricted_client(
            query=f"DROP TABLE IF EXISTS {clickhouse_credential.databasename}.{table_name}",
            username=clickhouse_credential.username,
            password=clickhouse_credential.password,
        )
        create_table_query = self.generate_create_table_query(
            query=query,
            table_name=table_name,
            db_name=clickhouse_credential.databasename,
        )
        self.logger.info(f"Executing create table query: {create_table_query}")
        result = self.execute_query_for_restricted_client(
            query=create_table_query,
            username=clickhouse_credential.username,
            password=clickhouse_credential.password,
        )
        self.logger.info(
            f"Created a clickhouse table {table_name} in {clickhouse_credential.databasename} database for user {clickhouse_credential.username}"
        )

    def drop_table(self, table_name: str, clickhouse_credential: ClickHouseCredential):
        query = (
            f"DROP TABLE IF EXISTS {clickhouse_credential.databasename}.{table_name}"
        )
        self.logger.info(f"Executing drop table query: {query}")
        result = self.execute_query_for_restricted_client(
            query=query,
            username=clickhouse_credential.username,
            password=clickhouse_credential.password,
        )
        self.logger.info(
            f"Dropped a clickhouse table {table_name} from {clickhouse_credential.databasename} database for user {clickhouse_credential.username}"
        )
