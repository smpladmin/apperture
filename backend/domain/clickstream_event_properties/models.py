from typing import List

from domain.common.models import Property, CaptureEvent
from repositories import Document


class ClickStreamEventProperties(Document):
    event: CaptureEvent
    properties: List[Property]

    class Settings:
        name = "clickstream_event_properties"
