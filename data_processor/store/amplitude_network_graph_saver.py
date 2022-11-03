import logging
import os

import pandas as pd
import numpy as np
import requests

from domain.common.models import IntegrationProvider

from .saver import Saver


class AmplitudeNetworkGraphSaver(Saver):
    def __init__(self):
        pass

    def save(self, datasource_id: str, provider: IntegrationProvider, df: pd.DataFrame):
        df = df.rename(
            columns={
                "previousPage": "previousEvent",
                "pagePath": "currentEvent",
                "pageViews": "hits",
                "time": "date",
            }
        )
        df.date = df.date.apply(lambda x: x.strftime("%Y-%m-%d"))
        df = df.replace({np.nan: None})
        edges = df.to_dict("records")
        data = {"datasourceId": datasource_id, "provider": provider, "edges": edges}
        res = self._save_data(data)
        if not res.ok:
            raise Exception(
                f"Error saving data for datasource_id {datasource_id}, response status - {res.status_code}"
            )
        logging.info("SAVED")

    def _save_data(self, data):
        return requests.post(
            f"{os.getenv('BACKEND_BASE_URL')}/private/edges",
            headers={
                f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv(
                    "BACKEND_API_KEY_SECRET"
                )
            },
            json=data,
        )
