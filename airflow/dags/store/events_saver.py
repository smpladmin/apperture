from datetime import datetime
import json
import logging
from typing import List
import pandas as pd

from domain.datasource.models import IntegrationProvider, CreateEvent
from store.clickhouse import Clickhouse
from .saver import Saver


class EventsSaver(Saver):
    def __init__(
        self,
    ):
        self.clickhouse = Clickhouse()

    def save(self, datasource_id: str, provider: IntegrationProvider, df: pd.DataFrame):
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

        self._save_data(json.loads(events))

        logging.info("SAVED")

    def _save_data(self, data: List[CreateEvent]):
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
        self.clickhouse.client.insert(
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
