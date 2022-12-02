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

    def supports_runlogs(self):
        return self in [self.MIXPANEL, self.AMPLITUDE]


class WatchlistItemType(str, Enum):
    NOTIFICATIONS = "notifications"
    FUNNELS = "funnels"


class SavedItems(BaseModel):
    type: WatchlistItemType
    details: Union[Funnel, Notification]
