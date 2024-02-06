import gzip
import io
import logging
from typing import Union
import requests
from functools import reduce
import pandas as pd
from domain.datasource.models import ClickHouseRemoteConnectionCred
from store.clickhouse_client_factory import ClickHouseClientFactory


class BranchDataSaver:
    def __init__(
        self,
        app_id,
        clickhouse_server_credentials: Union[ClickHouseRemoteConnectionCred, None],
    ):
        self.app_id = app_id
        self.client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credentials
        ).connection

    def convert_header_to_attribute(self, column_names, column_types={}):
        column_types = {**column_types, "timestamp": "datetime"}
        attr = ""
        for header in column_names:
            attr += header + (
                f" {column_types[header]} ," if header in column_types else " String ,"
            )
        return attr

    def create_table(self, table_name, column_names, database_name, column_types={}):
        attributes = self.convert_header_to_attribute(
            column_names=column_names, column_types=column_types
        )
        create_table_query = f"CREATE TABLE IF NOT EXISTS {database_name}.{table_name} ({attributes}) ENGINE = MergeTree ORDER BY timestamp"
        logging.info("### CREATE QUERY")
        logging.info(create_table_query)
        self.client.query(create_table_query)

    def save(self, table_name, event_data, database_name="default", column_types={}):
        data = event_data.values.tolist()
        column_names = event_data.columns.tolist()
        self.create_table(
            table_name=table_name,
            column_names=column_names,
            database_name=database_name,
            column_types=column_types,
        )
        logging.info(f"SAVING {len(data)} entries in {database_name}.{table_name}")
        self.client.insert(
            data=data,
            table=table_name,
            database=database_name,
            column_names=column_names,
        )
        logging.info(f"EVENTS saved successfully!")
