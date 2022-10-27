import os

from dotenv import load_dotenv
load_dotenv(override=False)
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest import mock
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from rest.controllers import notification_controller


app = FastAPI()
# TODO: allow only specific origins

# app.add_middleware(SessionMiddleware, secret_key=os.environ.get("SESSION_SECRET"))
# app.include_router(notification_controller.router)


@mock.patch("rest.controllers.notification_controller.validate_jwt")
def test_get_notification(mock_validate):
    # MockDPQueueService.enqueue.return_value = "absbsde"
    mock_validate.return_value = True
    origins = ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(SessionMiddleware, secret_key=os.environ.get("SESSION_SECRET"))
    app.include_router(notification_controller.router)
    client = TestClient(app)
    headers = {
        "Authorization": ""}
    response = client.get("/notifications?name=notif1", headers=headers)
    print(response.text)
    assert response.status_code == 200
    # assert response.json() == {"msg": "Hello World"}