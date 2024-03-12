from typing import Dict

import requests
from settings import EventsSettings

event_settings = EventsSettings()

BACKEND_API_KEY_NAME = event_settings.backend_api_key_name
BACKEND_API_KEY_SECRET = event_settings.backend_api_key_secret
BACKEND_BASE_URL = event_settings.backend_base_url


def get(path: str):
    headers = {f"{BACKEND_API_KEY_NAME}": BACKEND_API_KEY_SECRET}
    response = requests.get(f"{BACKEND_BASE_URL}{path}", headers=headers)
    return response


def post(path: str, json: Dict = {}):
    headers = {f"{BACKEND_API_KEY_NAME}": BACKEND_API_KEY_SECRET}

    response = requests.post(f"{BACKEND_BASE_URL}{path}", headers=headers, json=json)
    return response
