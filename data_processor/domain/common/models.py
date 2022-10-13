from enum import Enum


class IntegrationProvider(str, Enum):
    GOOGLE = "google"
    MIXPANEL = "mixpanel"
    AMPLITUDE = "amplitude"


class DataFormat(str, Enum):
    BINARY = "binary"
    UNICODE = "unicode"