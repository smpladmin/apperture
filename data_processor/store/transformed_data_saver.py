import logging
import os
import pandas as pd
import requests
from datetime import datetime as dt

from domain.common.models import IntegrationProvider
from .saver import Saver


class TransformedDataSaver(Saver):
    def __init__(self):
        pass

    def save(self, datasource_id: str, provider: IntegrationProvider, df: pd.DataFrame):
        logging.info("{x}: {y}".format(x='Saving Transformed data for', y=datasource_id))
        df['previousPage'] = df['previousPage'].str.replace('\(entrance\)', 'Entrance')
        df = df.rename(
            columns={
                "previousPage": "previousEvent",
                "pagePath": "currentEvent",
                "pageViews": "hits",
            }
        )
        df["date"] = df["date"].apply(
            lambda x: dt.strptime(x, "%Y%m%d").strftime("%Y-%m-%d")
        )
        edges = df.to_dict("records")
        data = {"datasourceId": datasource_id, "provider": provider, "edges": edges}
        res = self._save_data(data)
        if not res.ok:
            logging.info("{x}: {y}".format(x='Error saving data for datasource_id', y=datasource_id))
            logging.info("{x}: {y}".format(x='Error saving data with response status', y=res.status_code))
            return
        logging.info("Saved Successfully")

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
