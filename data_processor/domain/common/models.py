from enum import Enum


class IntegrationProvider(str, Enum):
    GOOGLE = "google"
    MIXPANEL = "mixpanel"
    AMPLITUDE = "amplitude"
    CLEVERTAP = "clevertap"
    API = "api"


class DataFormat(str, Enum):
    BINARY = "binary"
    UNICODE = "unicode"
