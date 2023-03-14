import datetime
from enum import Enum
from typing import List, Literal, Optional

from beanie import PydanticObjectId
from pydantic import BaseModel

from repositories import Document


class UrlMatching(str, Enum):
    CONTAINS = "contains"
    REGEX = "regex"
    EXACT = "exact"


class ActionGroupCondition(str, Enum):
    AND = "and"
    OR = "or"


class CaptureEvent(str, Enum):
    AUTOCAPTURE = "$autocapture"
    PAGEVIEW = "$pageview"


class ActionGroup(BaseModel):
    tag_name: Optional[str]
    text: Optional[str]
    href: Optional[str]
    selector: Optional[str]
    url: Optional[str]
    url_matching: Optional[UrlMatching]
    event: Optional[CaptureEvent]
    condition: ActionGroupCondition = ActionGroupCondition.OR


class Action(Document):
    name: str
    event_type: Optional[CaptureEvent]
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    groups: List[ActionGroup]
    processed_till: Optional[datetime.datetime]
    enabled: bool = True

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


OperatorType = Literal[
    "exact",
    "is_not",
    "icontains",
    "not_icontains",
    "regex",
    "not_regex",
    "gt",
    "lt",
    "gte",
    "lte",
    "is_set",
    "is_not_set",
    "is_date_exact",
    "is_date_after",
    "is_date_before",
]
