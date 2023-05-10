from datetime import datetime
from enum import Enum
from typing import Dict, List, NamedTuple, Optional

from pydantic import BaseModel


class CaptureEvent(str, Enum):
    PAGEVIEW = "$pageview"
    PAGELEAVE = "$pageleave"
    AUTOCAPTURE = "$autocapture"
    RAGECLICK = "$rageclick"
    IDENTIFY = "$identify"


class Element(BaseModel):
    text: Optional[str]
    tag_name: Optional[str]
    href: Optional[str]
    attr_id: Optional[str]
    attr_class: Optional[List[str]]
    nth_child: Optional[int]
    nth_of_type: Optional[int]
    attributes: Dict


class ClickStream(NamedTuple):
    datasourceId: str
    timestamp: datetime
    userId: str
    element_chain: str
    event: str
    properties: dict

    @staticmethod
    def build(
        datasource_id: str,
        timestamp: int,
        user_id: str,
        event: str,
        properties: Dict,
    ):
        element_chain = (
            ClickStream.build_element_chain(properties["$elements"])
            if event == CaptureEvent.AUTOCAPTURE
            else ""
        )
        return ClickStream(
            datasourceId=datasource_id,
            timestamp=datetime.fromtimestamp(timestamp),
            userId=user_id,
            element_chain=element_chain,
            event=event,
            properties=properties,
        )

    @staticmethod
    def build_element_chain(properties_elements):
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
        return ClickStream.elements_to_string(elements=elements)

    @staticmethod
    def elements_to_string(elements: List[Element]) -> str:
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
                ClickStream._escape(key): ClickStream._escape(str(value))
                for key, value in sorted(attributes.items())
            }
            el_string += ":"
            el_string += "".join(
                ['{}="{}"'.format(key, value) for key, value in attributes.items()]
            )
            ret.append(el_string)
        return ";".join(ret)

    @staticmethod
    def _escape(input: str) -> str:
        return input.replace('"', r"\"")


class PrecisionEvent(NamedTuple):
    datasourceId: str
    timestamp: datetime
    provider: str
    userId: str
    eventName: str
    properties: dict

    @staticmethod
    def build(datasourceId, timestamp, userId, eventName, properties):
        return PrecisionEvent(
            datasourceId=datasourceId,
            timestamp=datetime.fromtimestamp(timestamp),
            provider="apperture",
            userId=userId,
            eventName=eventName,
            properties=properties,
        )
