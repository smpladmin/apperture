import os
import json
import logging
import requests
import pandas as pd
from typing import List

from store.saver import Saver
from domain.common.models import IntegrationProvider


class EventPropertiesSaver(Saver):
    def __init__(self):
        pass

    def find_union(self, items: List[List]):
        union = set()
        for item in items:
            union |= set(item)
        return list(union)

    def save(self, datasource_id: str, df: pd.DataFrame, provider: IntegrationProvider):
        df["properties"] = df["properties"].apply(lambda x: list(x.keys()))
        event_properties = df.groupby("eventName").apply(
            lambda x: self.find_union(x["properties"].to_list())
        )

        for event, props in event_properties.iteritems():
            logging.info(f"Saving event properties for event {event}")
            data = json.dumps(
                {"event": event, "properties": props, "provider": provider}
            )
            res = self._save_data(data, datasource_id)

            if not res.ok:
                logging.debug(
                    f"Error saving event properties for event {event} of datasource_id {datasource_id}, response status - {res.status_code} - {res.content}"
                )
            else:
                logging.info("SAVED")

    def _save_data(self, data, datasource_id):
        return requests.post(
            f"{os.getenv('BACKEND_BASE_URL')}/private/event_properties/{datasource_id}",
            headers={
                f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv(
                    "BACKEND_API_KEY_SECRET"
                )
            },
            data=data,
        )
