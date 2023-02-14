import datetime
from enum import Enum

from beanie import PydanticObjectId
from typing import List, Optional

from pydantic import BaseModel

from repositories import Document


class UrlMatching(str, Enum):
    CONTAINS = "contains"
    REGEX = "regex"
    EXACT = "exact"


class ActionGroupCondition(str, Enum):
    AND = "and"
    OR = "or"


class ActionGroup(BaseModel):
    tag_name: Optional[str]
    text: Optional[str]
    href: Optional[str]
    selector: Optional[str]
    url: Optional[str]
    url_matching: Optional[UrlMatching]
    event: Optional[str]
    condition: ActionGroupCondition = ActionGroupCondition.OR


class CaptureEvent(str, Enum):
    AUTOCAPTURE = "$autocapture"
    PAGEVIEW = "$pageview"


class Action(Document):
    name: str
    event_type: CaptureEvent
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    groups: List[ActionGroup]
    processed_till: Optional[datetime.datetime]

    class Settings:
        name = "actions"


class ComputedEventStreamResult(BaseModel):
    event: str
    timestamp: datetime.datetime
    uid: str
    url: Optional[str]
    source: Optional[str]


class ComputedAction(BaseModel):
    count: int
    data: List[ComputedEventStreamResult]
