import logging
import clickhouse_connect
from datetime import datetime
from enum import Enum
from typing import Dict, List, NamedTuple, Optional
from pydantic import BaseModel


# ClickHouse configuration.
CLICKHOUSE_HOST = "clickhouse"
CLICKHOUSE_PORT = 8123
CLICKHOUSE_DATABASE = "default"
CLICKHOUSE_TABLE = "clickstream"


class CaptureEvent(str, Enum):
    PAGEVIEW = "$pageview"
    PAGELEAVE = "$pageleave"
    AUTOCAPTURE = "$autocapture"


class ClickstreamData(NamedTuple):
    datasourceId: str
    timestamp: datetime
    userId: str
    element_chain: str
    event: str
    properties: dict


class Element(BaseModel):
    text: Optional[str]
    tag_name: Optional[str]
    href: Optional[str]
    attr_id: Optional[str]
    attr_class: Optional[List[str]]
    nth_child: Optional[int]
    nth_of_type: Optional[int]
    attributes: Dict


class ClickHouse:
    def connect(self):
        self.client = clickhouse_connect.get_client(
            host="clickhouse",
            query_limit=0,
        )
        logging.info("Connected to ClickHouse")

    def disconnect(self):
        self.client.close()

    def save_events(self, events: Dict) -> None:
        """Saves events to ClickHouse."""
        logging.info(f"Saving {len(events)} events")
        cs_events = self.process_events(events)
        self.client.insert(
            "clickstream",
            cs_events,
            column_names=[
                "datasource_id",
                "timestamp",
                "user_id",
                "element_chain",
                "event",
                "properties",
            ],
            settings={"insert_async": True, "wait_for_async_insert": False},
        )
        logging.info("Saved events")

    def process_events(self, events):
        return [
            self._build_clickstream_data(
                datasource_id=event["properties"]["token"],
                timestamp=event["properties"]["$time"],
                user_id=event["properties"]["$device_id"],
                event=event["event"],
                properties=event["properties"],
            )
            for event in events
        ]

    def _build_clickstream_data(
        self,
        datasource_id: str,
        timestamp: str,
        user_id: str,
        event: str,
        properties: Dict,
    ):
        element_chain = (
            self._build_element_chain(properties["$elements"], event)
            if event == CaptureEvent.AUTOCAPTURE
            else ""
        )
        return ClickstreamData(
            datasourceId=datasource_id,
            timestamp=datetime.fromtimestamp(timestamp),
            userId=user_id,
            element_chain=element_chain,
            event=event,
            properties=properties,
        )

    def _build_element_chain(self, properties_elements, event):
        elements = [
            Element(
                text=element_dict.get("$el_text"),
                tag_name=element_dict.get("tag_name"),
                href=element_dict.get("attr__href"),
                attr_id=element_dict.get("attr__id"),
                attr_class=element_dict.get("classes"),
                nth_child=element_dict.get("nth_child"),
                nth_of_type=element_dict.get("nth_of_type"),
                attributes=element_dict.get("attributes", {}),
            )
            for element_dict in properties_elements
        ]
        return self._elements_to_string(elements=elements)

    def _elements_to_string(self, elements: List[Element]) -> str:
        ret = []
        for element in elements:
            el_string = ""
            if element.tag_name:
                el_string += element.tag_name
            if element.attr_class:
                for single_class in sorted(element.attr_class):
                    el_string += ".{}".format(single_class.replace('"', ""))
            attributes = {
                **({"text": element.text} if element.text else {}),
                "nth-child": element.nth_child or 0,
                "nth-of-type": element.nth_of_type or 0,
                **({"href": element.href} if element.href else {}),
                **({"attr_id": element.attr_id} if element.attr_id else {}),
                **element.attributes,
            }
            attributes = {
                self._escape(key): self._escape(str(value))
                for key, value in sorted(attributes.items())
            }
            el_string += ":"
            el_string += "".join(
                ['{}="{}"'.format(key, value) for key, value in attributes.items()]
            )
            ret.append(el_string)
        return ";".join(ret)

    def _escape(self, input: str) -> str:
        return input.replace('"', r"\"")
