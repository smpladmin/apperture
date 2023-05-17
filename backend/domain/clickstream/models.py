from enum import Enum
import datetime
from typing import List, NamedTuple, Optional
from pydantic import BaseModel


class CaptureEvent(str, Enum):
    PAGEVIEW = "$pageview"
    PAGELEAVE = "$pageleave"
    AUTOCAPTURE = "$autocapture"
    RAGECLICK = "$rageclick"
    IDENTIFY = "$identify"


class ClickstreamData(NamedTuple):
    datasourceId: str
    timestamp: datetime.datetime
    userId: str
    element_chain: str
    event: str
    properties: dict


class ComputedStreamElementProperty(BaseModel):
    text: List[str]
    aria_label: List[str]
    tag_name: List[str]


class ComputedStreamEvent(BaseModel):
    name: str
    type: str
    elements: ComputedStreamElementProperty


class ClickstreamResult(BaseModel):
    event: ComputedStreamEvent
    timestamp: datetime.datetime
    uid: str
    url: Optional[str]
    source: Optional[str]
