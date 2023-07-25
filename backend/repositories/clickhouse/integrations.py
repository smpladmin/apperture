import logging
import os

from repositories.clickhouse.base import EventsBase


class Integrations(EventsBase):
    def create_table_from_csv(
        self, name: str, username: str, password: str, db_name: str, s3_key: str
    ):
        s3_url = os.getenv("S3_PATH") + s3_key
        query = f"CREATE TABLE {db_name}.{name} ENGINE = MergeTree() ORDER BY tuple() AS SELECT * FROM s3('{s3_url}', '{os.getenv('AWS_ACCESS_KEY_ID')}', '{os.getenv('AWS_SECRET_ACCESS_KEY')}', CSVWithNames)"
        logging.info(f"query: {query}")
        self.execute_query_for_restricted_client(
            query=query, username=username, password=password
        )
