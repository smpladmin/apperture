import logging
from flatten_json import flatten
from collections import defaultdict
from itertools import chain
from typing import List, Dict

from apperture.backend_action import post, get
from models.models import EventProperties, CaptureEvent, ClickStreamEventProperties


class EventPropertiesSaver:
    def __init__(self):
        self.precise_events_map = {}
        self.cs_events_map = {}

    def create_precise_events_map(self, event_properties: List[EventProperties]):
        res = defaultdict(dict)
        for event in event_properties:
            res[event.datasourceId].setdefault(event.event, []).extend(
                property["name"] for property in event.properties
            )
        return dict(res)

    def create_cs_events_map(self, event_properties: List[ClickStreamEventProperties]):
        res = {}
        for event in event_properties:
            res[event.event] = [property["name"] for property in event.properties]

        return res

    def save_precision_event_properties(self, precision_events: List):
        try:
            # Iterate over precision events and save them using the post call
            logging.info(f"Precision Events map: {self.precise_events_map}")
            for precision_event in precision_events:
                datasource_id = precision_event["properties"]["token"]
                logging.info(f"event properties: {set(precision_event['properties'].keys())}")
                if set(
                    self.precise_events_map.get(datasource_id, {}).get(
                        precision_event["event"], []
                    )
                ) != set(precision_event["properties"].keys()):
                    logging.info("Saving criteria met. Saving to db")
                    data = {
                        "datasource_id": datasource_id,
                        "event": precision_event["event"],
                        "properties": list(
                            flatten(precision_event["properties"], ".").keys()
                        ),
                        "provider": "apperture",
                    }
                    self._save_data(path=f"/private/event_properties", data=data)

            # Update events map with the latest properties
            event_properties = [
                EventProperties.build(
                    datasourceId=item["datasourceId"],
                    event=item["event"],
                    properties=item["properties"],
                    provider=item["provider"],
                )
                for item in self.update_events_map(path=f"/private/event_properties")
            ]
            self.precise_events_map = self.create_precise_events_map(
                event_properties=event_properties
            )
        except Exception as e:
            logging.info(
                f"Exception while saving event properties for precise events: {e}"
            )

    def get_distinct_values(self, list_of_lists):
        flattened_list = list(chain.from_iterable(list_of_lists))
        distinct_values = list(set(flattened_list))
        distinct_values.sort()
        return distinct_values

    def save_cs_event_properties(self, events):
        try:
            # Update events map with the latest properties
            event_properties = [
                ClickStreamEventProperties.build(
                    event=item["event"],
                    properties=item["properties"],
                )
                for item in self.update_events_map(
                    path=f"/private/clickstream_event_properties"
                )
            ]
            self.cs_events_map = self.create_cs_events_map(
                event_properties=event_properties
            )
            logging.info(f"Clickstream Events map: {self.cs_events_map}")

            for event in [CaptureEvent.AUTOCAPTURE, CaptureEvent.PAGEVIEW]:
                logging.info(f"Saving properties for event: {event}")
                props = [
                    list(flatten(e["properties"], ".").keys())
                    for e in events
                    if e["event"] == event
                ]
                props = self.get_distinct_values(list_of_lists=props)

                if not set(props).issubset(set(self.cs_events_map.get(event, []))):
                    logging.info(f"Saving criteria met for {event} event. Saving to db")
                    new_props = self.get_distinct_values(
                        list_of_lists=[props, self.cs_events_map.get(event, [])]
                    )
                    data = {
                        "event": event,
                        "properties": new_props,
                    }
                    self._save_data(
                        path="/private/clickstream_event_properties", data=data
                    )

        except Exception as e:
            logging.info(
                f"Exception while saving event properties for clickstream events: {e}"
            )

    def _save_data(self, data: Dict, path: str):
        return post(path=path, json=data)

    def update_events_map(self, path: str):
        return get(path=path).json()
