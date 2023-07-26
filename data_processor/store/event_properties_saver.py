import logging
import pandas as pd
from typing import List, Dict

from store.saver import Saver
from domain.common.models import IntegrationProvider
from apperture.backend_action import post


class EventPropertiesSaver(Saver):
    def __init__(self):
        pass

    def find_union(self, items: List[List]):
        union = set()
        for item in items:
            union |= set(item)
        return list(union)

    def save(self, datasource_id: str, df: pd.DataFrame, provider: IntegrationProvider):
        try:
            df["properties"] = df["properties"].apply(lambda x: list(x.keys()))
            event_properties = df.groupby("eventName").apply(
                lambda x: self.find_union(x["properties"].to_list())
            )

            for event, props in event_properties.iteritems():
                logging.info(f"Saving event properties for event {event}")
                data = {
                    "datasource_id": datasource_id,
                    "event": event,
                    "properties": props,
                    "provider": provider,
                }
                res = self._save_data(data=data)

                if not res.ok:
                    logging.error(
                        f"Error saving event properties for event {event} of datasource_id {datasource_id}, response status - {res.status_code} - {res.content}"
                    )
                else:
                    logging.info("SAVED")
        except Exception as e:
            logging.info(f"Error while saving event properties")
            logging.debug(e)

    def _save_data(self, data: Dict):
        return post(path=f"/private/event_properties", json=data)
