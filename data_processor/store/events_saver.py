import logging
import os
import numpy as np
import pandas as pd
import requests
from apperture.backend_action import post

from domain.common.models import IntegrationProvider
from .saver import Saver


class EventsSaver(Saver):
    def __init__(self):
        pass

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

        chunks = np.array_split(df, 10)
        for chunk in chunks:
            events = chunk.to_json(orient="values")
            res = self._save_data(events)
            if not res.ok:
                raise Exception(
                    f"Error saving data for datasource_id {datasource_id}, response status - {res.status_code} - {res.content}"
                )
            logging.info("SAVED")

    def _save_data(self, data):
        return requests.post(
            f"{os.getenv('BACKEND_BASE_URL')}/private/events",
            headers={
                f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv(
                    "BACKEND_API_KEY_SECRET"
                )
            },
            data=data,
        )
