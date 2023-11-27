import logging
from typing import List, Union

from pandas import DataFrame

from domain.datasource.models import ClickHouseRemoteConnectionCred
from store.clickhouse_client_factory import ClickHouseClientFactory


class GoogleAdsDataSaver:
    def __init__(
        self,
        app_id,
        clickhouse_server_credentials: Union[ClickHouseRemoteConnectionCred, None],
    ):
        self.app_id = app_id
        self.client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credentials
        ).connection

    def convert_header_to_attribute(self, headers: List[str]):
        attr_list = []
        int_cols = ["impressions", "clicks", "interactions", "cost_micros"]
        float_cols = [
            "average_cpm",
            "average_cpc",
            "average_cpv",
            "average_cpe",
            "average_cost",
            "ctr",
        ]
        for header in headers:
            if header in int_cols:
                attr_list.append(header + " Int64")
            elif header in float_cols:
                attr_list.append(header + " Float64")
            elif header == "date":
                attr_list.append(header + " datetime")
            elif header == "ad_headlines":
                attr_list.append(header + " Array(String)")
            else:
                attr_list.append(header + " String")
        attr = ", ".join(attr_list)
        return attr

    def create_table(
        self, table_name: str, column_names: List[str], database_name: str
    ):
        attributes = self.convert_header_to_attribute(column_names)
        create_table_query = f"CREATE TABLE IF NOT EXISTS {database_name}.{table_name} ({attributes}) ENGINE = MergeTree ORDER BY date"
        logging.info(create_table_query)
        self.client.query(create_table_query)

    def save(
        self, event_data: DataFrame, table_name: str, database_name: str = "default"
    ):
        if not event_data.empty:
            data = event_data.values.tolist()
            column_names = event_data.columns.tolist()
            self.create_table(
                table_name=table_name,
                column_names=column_names,
                database_name=database_name,
            )
            logging.info(f"SAVING {len(data)} entries in {database_name}.{table_name}")
            self.client.insert(
                data=data,
                table=table_name,
                database=database_name,
                column_names=column_names,
            )
        logging.info(f"EVENTS saved successfully!")
