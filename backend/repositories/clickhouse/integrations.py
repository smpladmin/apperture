import logging
import os

from repositories.clickhouse.base import EventsBase


class Integrations(EventsBase):
    def create_table_from_csv(
        self, name: str, username: str, password: str, db_name: str, s3_key: str
    ):
        drop_query = f"DROP TABLE IF EXISTS {db_name}.{name}"
        logging.info(f"drop query: {drop_query}")
        drop_query_result = self.execute_query_for_restricted_client(
            query=drop_query, username=username, password=password
        )
        s3_url = os.getenv("S3_PATH") + s3_key
        create_query = f"CREATE TABLE {db_name}.{name} ENGINE = MergeTree() ORDER BY tuple() AS SELECT * FROM s3('{s3_url}', '{os.getenv('AWS_ACCESS_KEY_ID')}', '{os.getenv('AWS_SECRET_ACCESS_KEY')}', CSVWithNames)"
        logging.info(f"create query: {create_query}")
        create_query_result = self.execute_query_for_restricted_client(
            query=create_query, username=username, password=password
        )

        return drop_query_result and create_query_result
