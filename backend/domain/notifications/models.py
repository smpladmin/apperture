from typing import List, Dict
from beanie import PydanticObjectId
from repositories.document import Document


class Notification(Document):
    datasource_id: PydanticObjectId
    user_id: PydanticObjectId
    notification_type: str
    apperture_managed: bool
    pct_threshold_active: bool
    pct_threshold_values: List[float]
    absolute_threshold_active: bool
    absolute_threshold_values: List[float]
    formula: str
    variable_map: Dict
    preferred_hour_gmt: int
    frequency: str
    preferred_channels: List[str]
    notification_active: bool

    class Settings:
        name = "notifications"
