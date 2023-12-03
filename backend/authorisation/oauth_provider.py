from enum import Enum


class OAuthProvider(str, Enum):
    GOOGLE = "google"
    SLACK = "slack"


class GoogleOauthContext(str, Enum):
    SHEET = "google_sheets"
    ANALYTICS = "google_analytics"
