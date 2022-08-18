import os

from dotenv import load_dotenv
from googleapiclient.discovery import build
from oauth2client.client import GoogleCredentials
from google.analytics.data import BetaAnalyticsDataClient
from google.oauth2.credentials import Credentials

load_dotenv()


def initialize_v3_analytics(access_token, refresh_token):
    creds = GoogleCredentials(
        access_token=access_token,
        refresh_token=refresh_token,
        token_uri=os.environ["TOKEN_URI"],
        client_id=os.environ["CLIENT_ID"],
        client_secret=os.environ["CLIENT_SECRET"],
        user_agent=None,
        token_expiry=None,
    )
    return build("analyticsreporting", "v4", credentials=creds)


def initialize_v4_analytics(access_token, refresh_token):
    creds = Credentials(
        access_token,
        refresh_token=refresh_token,
        token_uri=os.environ["TOKEN_URI"],
        client_id=os.environ["CLIENT_ID"],
        client_secret=os.environ["CLIENT_SECRET"],
    )
    return BetaAnalyticsDataClient(credentials=creds)
