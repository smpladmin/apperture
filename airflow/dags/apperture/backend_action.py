import os
import requests
from typing import Dict, Union
from dotenv import load_dotenv

load_dotenv(override=False)


def get(path: str):
    headers = {
        f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv("BACKEND_API_KEY_SECRET")
    }
    response = requests.get(f"{os.getenv('BACKEND_BASE_URL')}{path}", headers=headers)
    return response


def post(path: str, json: Dict = {}, data: Union[None, Dict] = None):
    headers = {
        f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv("BACKEND_API_KEY_SECRET")
    }
    url = f"{os.getenv('BACKEND_BASE_URL')}{path}"
    response = (
        requests.post(url, headers=headers, data=data)
        if data
        else requests.post(url, headers=headers, json=json)
    )
    return response
