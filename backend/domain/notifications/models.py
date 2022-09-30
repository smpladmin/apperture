from typing import List, Dict, Optional
from pydantic import BaseModel
from beanie import PydanticObjectId
from repositories.document import Document


class Notification(Document):
    datasource_id: PydanticObjectId
    user_id: PydanticObjectId
    notification_type: str
    apperture_managed: bool
    pct_threshold_active: bool
    pct_threshold_values: Dict
    absolute_threshold_active: bool
    absolute_threshold_values: Dict
    formula: str
    variable_map: Dict
    preferred_hour_gmt: int
    frequency: str
    preferred_channels: List[str]
    notification_active: bool

    class Settings:
        name = "notifications"


class ComputedNotification(BaseModel):
    name: str
    value: float
    pct_change: Optional[float]
    metric: Optional[str]
    user_threshold: Optional[float]
