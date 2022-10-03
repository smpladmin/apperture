from enum import Enum


class IntegrationProvider(str, Enum):
    GOOGLE = "google"
    MIXPANEL = "mixpanel"

    def supports_runlogs(self):
        return self in [self.MIXPANEL]
