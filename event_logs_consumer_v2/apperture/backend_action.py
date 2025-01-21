import os
from typing import Dict

import requests


def get(path: str):
    headers = {
        f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv("BACKEND_API_KEY_SECRET")
    }
    response = requests.get(f"{os.getenv('BACKEND_BASE_URL')}{path}", headers=headers)
    return response


def post(path: str, json: Dict = {}):
    headers = {
        f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv("BACKEND_API_KEY_SECRET")
    }
    response = requests.post(
        f"{os.getenv('BACKEND_BASE_URL')}{path}", headers=headers, json=json
    )
    return response
