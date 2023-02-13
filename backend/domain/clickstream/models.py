from enum import Enum
import datetime
from typing import NamedTuple, Optional
from pydantic import BaseModel


class CaptureEvent(str, Enum):
    PAGEVIEW = "$pageview"
    PAGELEAVE = "$pageleave"
    AUTOCAPTURE = "$autocapture"


class ClickstreamData(NamedTuple):
    datasourceId: str
    timestamp: datetime.datetime
    userId: str
    element_chain: str
    event: str
    properties: dict


class ClickstreamResult(BaseModel):
    event: str
    timestamp: datetime.datetime
    uid: str
    url: Optional[str]
    source: Optional[str]
