import os
from typing import Optional

import requests
from fastapi import Depends, Header, HTTPException

from rest.middlewares import get_token


def validate_recaptcha_token(
    recaptcha_token: Optional[str] = Header(None),
):
    if recaptcha_token:
        response = requests.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": os.getenv("RECAPTCHA_SECRET_KEY"),
                "response": recaptcha_token,
            },
        )
        response_data = response.json()
        if not response_data["success"]:
            raise HTTPException(status_code=401, detail="Could not verify recaptcha")
    else:
        raise HTTPException(status_code=401, detail="Invalid recaptcha token")
