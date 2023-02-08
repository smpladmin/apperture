from enum import Enum
import datetime
from typing import NamedTuple


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
