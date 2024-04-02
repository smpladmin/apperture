import logging
from typing import Union
from clickhouse.clickhouse import ClickHouse
from pandas import DataFrame
from fastapi_cache.decorator import cache

from cache import CACHE_EXPIRY_10_MINUTES, event_config_cache

from models.models import ClickHouseCredentials, EventTablesBucket
from apperture.backend_action import get


clickhouse_to_pandas_type_map = {
    "Int8": "Int8",
    "Int16": "Int16",
    "Int32": "Int32",
    "Int64": "Int64",
    "UInt8": "Int8",
    "UInt16": "Int16",
    "UInt32": "Int32",
    "UInt64": "Int64",
    "Float32": "Float32",
    "Float64": "Float64",
    "String": "string",
    "DateTime": "datetime64[ns]",
    "Array": "object",
    "Object('json')": "object",
    "Nullable(Int8)": "Int8",
    "Nullable(Int16)": "Int16",
    "Nullable(Int32)": "Int32",
    "Nullable(Int64)": "Int64",
    "Nullable(UInt8)": "Int8",
    "Nullable(UInt16)": "Int16",
    "Nullable(UInt32)": "Int32",
    "Nullable(UInt64)": "Int64",
    "Nullable(Float32)": "Float32",
    "Nullable(Float64)": "Float64",
    "Nullable(String)": "string",
    "Nullable(DateTime)": "datetime64[ns]",
    "Nullable(Object('json'))": "object",
}


class EventTablesConfig:
    def __init__(self):
        self.event_tables: dict[str, EventTablesBucket] = {}
        self.topics = []
        self.clickhouse = ClickHouse()

    @cache(expire=CACHE_EXPIRY_10_MINUTES, key_builder=event_config_cache)
    async def get_config_for_integration(self, integration_id: str, datasource_id: str):
        # datasource_id passed for creating key in above cache method
        integration = get(f"/private/integrations/{integration_id}").json()
        config_credential = integration["credential"].get(
            "events_config_credential", None
        )
        if config_credential:
            return config_credential.get("config", None)
        return None

    def get_filtered_config_for_table(
        self, table: str, event_source_destination_config
    ):
        filtered_config = [
            item
            for item in event_source_destination_config
            if item["destination_table"] == table
        ]
        return filtered_config

    def get_table_columns_with_type(
        self,
        table: str,
        database: str,
        ch_server_credential: Union[ClickHouseCredentials, None],
        app_id: str,
    ):
        return self.clickhouse.get_table_columns_with_type(
            table=table,
            database=database,
            clickhouse_server_credential=ch_server_credential,
            app_id=app_id,
        )

    def get_table_primary_key(
        self,
        table: str,
        database: str,
        ch_server_credential: Union[ClickHouseCredentials, None],
        app_id: str,
    ):
        return self.clickhouse.get_table_primary_key(
            table=table,
            database=database,
            clickhouse_server_credential=ch_server_credential,
            app_id=app_id,
        )

    def get_row_values(
        self,
        id: str,
        id_values: list,
        table: str,
        database: str,
        ch_server_credential: Union[ClickHouseCredentials, None],
        app_id: str,
    ):
        return self.clickhouse.get_row_values(
            table=table,
            database=database,
            id_values=id_values,
            id=id,
            clickhouse_server_credential=ch_server_credential,
            app_id=app_id,
        )

    def is_table_in_audit_config(self, table: str, audit_config):
        for config in audit_config:
            if config.get("table") == table and config.get("create_audit_table"):
                return True
        return False

    async def get_topics_from_event_config(self):
        event_logs_datasources = get(
            path="/private/datasources?provider=event_logs"
        ).json()

        for datasource in event_logs_datasources:
            config = await self.get_config_for_integration(
                integration_id=datasource["integrationId"],
                datasource_id=datasource["_id"],
            )
            if config:
                event_source_destination_config = config[
                    "event_source_destination_config"
                ]
                audit_config = config["audit_config"]
                app = get(path=f"/private/apps/{datasource['appId']}").json()

                for event in event_source_destination_config:
                    table = event["destination_table"]
                    topic = f"eventlogs_{datasource['_id']}_{table}"

                    if not topic in self.topics:
                        self.topics.append(topic)
                        ch_db = app["clickhouseCredential"]["databasename"]
                        ch_server_credential = (
                            ClickHouseCredentials(**app["remoteConnection"])
                            if app["remoteConnection"]
                            else None
                        )
                        app_id = datasource["appId"]

                        column_type_list = self.get_table_columns_with_type(
                            table=table,
                            database=ch_db,
                            ch_server_credential=ch_server_credential,
                            app_id=app_id,
                        )
                        column_to_type_map = {
                            column: clickhouse_to_pandas_type_map[data_type]
                            for column, data_type in column_type_list
                        }
                        columns = list(column_to_type_map.keys())

                        self.event_tables[topic] = EventTablesBucket(
                            data=DataFrame(columns=columns),
                            audit_data=DataFrame(columns=columns),
                            ch_db=ch_db,
                            ch_table=event["destination_table"],
                            ch_server_credential=ch_server_credential,
                            app_id=app_id,
                            table_config=self.get_filtered_config_for_table(
                                table=table,
                                event_source_destination_config=event_source_destination_config,
                            ),
                            columns_with_types=column_to_type_map,
                            primary_key=self.get_table_primary_key(
                                table=table,
                                database=ch_db,
                                ch_server_credential=ch_server_credential,
                                app_id=app_id,
                            ),
                            save_to_audit_table=self.is_table_in_audit_config(
                                table=table, audit_config=audit_config
                            ),
                        )
