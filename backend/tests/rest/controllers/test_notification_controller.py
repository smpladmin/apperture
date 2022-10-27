
from dotenv import load_dotenv

from mongo.mongo import Mongo

from rest.middlewares import get_user, validate_jwt

load_dotenv(override=False)
from fastapi.testclient import TestClient
from unittest import mock


from server import app


def test_get_notification(test_client_init):
    
    client=test_client_init
    response = client.get("/notifications/?name=notif1")
    print(response.text)
    assert response.status_code == 200
    # assert response.json() == {"msg": "Hello World"}
