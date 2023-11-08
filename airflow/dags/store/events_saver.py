from datetime import datetime
import json
import logging
from typing import List, Union
import pandas as pd
from store.clickhouse_client_factory import ClickHouseClient, ClickHouseClientFactory
from apperture.backend_action import get

from domain.datasource.models import (
    IntegrationProvider,
    CreateEvent,
    ClickHouseRemoteConnectionCred,
)
from store.clickhouse import Clickhouse
from .saver import Saver


class EventsSaver(Saver):
    def __init__(
        self,
    ):
        self.clickhouse = Clickhouse()

    def save(
        self,
        datasource_id: str,
        provider: IntegrationProvider,
        df: pd.DataFrame,
        clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
        app_id: str,
    ):
        df["provider"] = provider.value
        df["datasourceId"] = datasource_id
        df = df.fillna("")
        df = df[
            [
                "datasourceId",
                "timestamp",
                "provider",
                "userId",
                "eventName",
                "properties",
            ]
        ]

        events = df.to_json(orient="values")
        clickhouse_client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credential
        )
        self._save_data(data=json.loads(events), clickhouse_client=clickhouse_client)

        logging.info("SAVED")

    def _save_data(self, data: List[CreateEvent], clickhouse_client: ClickHouseClient):
        events = [
            CreateEvent(
                datasourceId=event[0],
                timestamp=datetime.strptime(event[1], "%Y-%m-%d %H:%M:%S"),
                provider=IntegrationProvider(event[2]),
                userId=event[3],
                eventName=event[4],
                properties=dict(event[5]),
            )
            for event in data
        ]

        clickhouse_client.connection.insert(
            "events",
            events,
            column_names=[
                "datasource_id",
                "timestamp",
                "provider",
                "user_id",
                "event_name",
                "properties",
            ],
        )
