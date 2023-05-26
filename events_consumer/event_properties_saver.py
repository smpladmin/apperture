import logging
from typing import List, Dict

from apperture.backend_action import post, get


class EventPropertiesSaver:
    def __init__(self):
        self.events_map = {}

    def save_precision_event_properties(self, precision_events: List):
        try:
            # Iterate over precision events and save them using the post call
            for precision_event in precision_events:
                datasource_id = precision_event["properties"]["token"]
                if set(
                    self.events_map.get(datasource_id, {}).get(
                        precision_event["event"], []
                    )
                ) != set(precision_event["properties"].keys()):
                    logging.info("Saving criteria met. Saving to db")
                    logging.info(self.events_map)
                    logging.info(precision_event["properties"].keys())
                    data = {
                        "event": precision_event["event"],
                        "properties": list(precision_event["properties"].keys()),
                        "provider": "apperture",
                    }
                    self._save_data(data=data, datasource_id=datasource_id)

            # Update events map with the latest properties
            self.events_map = self.update_events_map()
        except Exception as e:
            logging.info("Error while saving event properties")
            logging.info(e)

    def _save_data(self, data: Dict, datasource_id: str):
        return post(path=f"/private/event_properties/{datasource_id}", json=data)

    def update_events_map(self):
        return get(path=f"/private/event_properties").json()
