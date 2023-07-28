import logging
import os

from fastapi import Depends

from clickhouse import Clickhouse
from repositories.clickhouse.base import EventsBase


class Integrations(EventsBase):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        super().__init__(clickhouse=clickhouse)
        self.s3_path = os.getenv("S3_PATH")
        self.aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")

    def create_table_from_csv(self, name: str, db_name: str, s3_key: str):
        drop_query = f"DROP TABLE IF EXISTS {db_name}.{name}"
        logging.info(f"drop query: {drop_query}")
        self.clickhouse.client.query(query=drop_query)

        s3_url = self.s3_path + s3_key
        create_query = f"CREATE TABLE {db_name}.{name} ENGINE = MergeTree() ORDER BY tuple() AS SELECT * FROM s3('{s3_url}', '{self.aws_access_key}', '{self.aws_secret_access_key}', CSVWithNames)"
        logging.info(f"create query: {create_query}")
        self.clickhouse.client.query(query=create_query)
