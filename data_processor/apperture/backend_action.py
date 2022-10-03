import os

import requests


def get(path: str):
    headers = {
        f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv("BACKEND_API_KEY_SECRET")
    }
    response = requests.get(
        f"{os.getenv('BACKEND_BASE_URL')}{path}",
        headers=headers,
    )
    return response
