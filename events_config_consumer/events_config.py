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
    "String": "str",
    "DateTime": "datetime64[ns]",
    "Array": "object",
    "Array(String)": "object",
    "Array(Int64)": "object",
    "Array(Array(Int64))": "object",
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
    "Nullable(String)": "str",
    "Nullable(DateTime)": "datetime64[ns]",
    "Nullable(Object('json'))": "object",
}

INT_TYPES = ["Int64", "Int8", "Int16", "Int32", "INT128"]

FLOAT_TYPES = ["Float64", "Float32"]


class EventTablesConfig:
    def __init__(self):
        self.event_tables: dict[str, EventTablesBucket] = {}
        self.topics = []
        self.events_config = {}
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

    async def get_topics_from_event_config(self):
        event_logs_datasources = get(
            path="/private/datasources?provider=event_logs"
        ).json()

        for datasource in event_logs_datasources:
            # topic to read events from, defined in logs producer
            topic = f"eventsconfig_{datasource['_id']}"
            self.topics.append(topic)

            config = await self.get_config_for_integration(
                integration_id=datasource["integrationId"],
                datasource_id=datasource["_id"],
            )
            if config:
                events_table_config = config["events_table_config"]
                self.events_config = events_table_config
                app = get(path=f"/private/apps/{datasource['appId']}").json()

                for table, config in events_table_config.items():
                    # create buckets based on config tables
                    table_topic = f"eventsconfig_{datasource['_id']}_{table}"
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

                    self.event_tables[table_topic] = EventTablesBucket(
                        events=[],
                        data=DataFrame(columns=columns),
                        audit_data=DataFrame(columns=columns),
                        ch_db=ch_db,
                        ch_table=table,
                        ch_server_credential=ch_server_credential,
                        app_id=app_id,
                        table_config=config,
                        columns_with_types=column_to_type_map,
                        primary_key=self.get_table_primary_key(
                            table=table,
                            database=ch_db,
                            ch_server_credential=ch_server_credential,
                            app_id=app_id,
                        ),
                        save_to_audit_table=config.get("create_audit_table"),
                    )
