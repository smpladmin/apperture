from enum import Enum
from typing import Union
from pydantic import BaseModel
from domain.funnels.models import Funnel
from domain.notifications.models import Notification


class IntegrationProvider(str, Enum):
    GOOGLE = "google"
    MIXPANEL = "mixpanel"
    AMPLITUDE = "amplitude"
    CLEVERTAP = "clevertap"
    APPERTURE = "apperture"
    DATABASE = "database"

    def supports_runlogs(self):
        return self in [self.MIXPANEL, self.AMPLITUDE, self.CLEVERTAP]


class WatchlistItemType(str, Enum):
    NOTIFICATIONS = "notifications"
    FUNNELS = "funnels"


class SavedItems(BaseModel):
    type: WatchlistItemType
    details: Union[Funnel, Notification]


class Property(BaseModel):
    name: str
    type: str


class CaptureEvent(str, Enum):
    AUTOCAPTURE = "$autocapture"
    PAGEVIEW = "$pageview"
    PAGELEAVE = "$pageleave"
    RAGECLICK = "$rageclick"
    IDENTIFY = "$identify"
