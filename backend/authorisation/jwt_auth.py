from datetime import datetime, timedelta
import os
from jose import jwt


SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
JWT_EXPIRY_MINUTES = int(os.getenv("JWT_EXPIRY_MINUTES", 10080))


def create_access_token(data: dict):
    to_encode = data.copy()
    expiry = datetime.utcnow() + timedelta(minutes=JWT_EXPIRY_MINUTES)
    to_encode.update({"exp": expiry})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def validate(token: str):
    return jwt.decode(token, SECRET_KEY, ALGORITHM)


def decode(token: str):
    return jwt.get_unverified_claims(token)
