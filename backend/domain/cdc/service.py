from datetime import datetime
from typing import Optional
from domain.apps.models import App
from clickhouse.clickhouse_client_factory import ClickHouseClientFactory
from utils.cdc_tables import (
    DEFAULT_START_DATE_FOR_CDC_TABLES,
    WIOM_CDC_TABLES_WITH_ADDED_TIME_COLUMN,
)


class CDCService:
    def __init__(
        self,
    ) -> None:
        pass

    async def get_last_ingested_date_str(
        self, column: str, table: str, database: str, app: App
    ):
        clickhouse_database = app.clickhouse_credential.databasename
        client = await ClickHouseClientFactory.get_client(app_id=app.id)
        query = f"Select {column} from {clickhouse_database}.{table} where shard='{database}' order by {column} desc limit 1"
        result = client.query(query=query).result_set
        if result:
            epoch_timestamp = result[0][0]
            formatted_date = datetime.utcfromtimestamp(epoch_timestamp / 1000).strftime(
                "%Y-%m-%d"
            )
            return formatted_date
        return DEFAULT_START_DATE_FOR_CDC_TABLES

    async def get_snapshot_override_query(
        self,
        database: str,
        table: str,
        app: App,
        date_column: Optional[str] = None,
        date_str: Optional[str] = None,
    ):
        column = date_column if date_column else "added_time"
        date = (
            date_str
            if date_str
            else await self.get_last_ingested_date_str(
                column=column, table=table, database=database, app=app
            )
        )

        return {
            f"snapshot.select.statement.overrides.dbo.{table}": f"select * from {database}.dbo.{table} where CONVERT(DATE, {column}) >= '{date}'"
        }

    async def generate_update_connector_config_to_resume(
        self, config: dict, app: App, date: Optional[str] = None
    ):
        tables = config["table.include.list"].split(",")
        database = config["database.names"]
        snapshot_override_str = config.get("snapshot.select.statement.overrides", "")
        snapshot_override_tables = (
            set()
            if not snapshot_override_str
            else set(snapshot_override_str.split(","))
        )

        for table in tables:
            table_name_without_dbo = table.split(".")[-1]
            if table_name_without_dbo in WIOM_CDC_TABLES_WITH_ADDED_TIME_COLUMN:
                snapshot_override_query_key_pair = (
                    await self.get_snapshot_override_query(
                        database=database,
                        table=table_name_without_dbo,
                        app=app,
                        date_str=date,
                    )
                )
                config.update(snapshot_override_query_key_pair)
                snapshot_override_tables.add(table)

        if snapshot_override_tables:
            config["snapshot.select.statement.overrides"] = ", ".join(
                snapshot_override_tables
            )
        return config
