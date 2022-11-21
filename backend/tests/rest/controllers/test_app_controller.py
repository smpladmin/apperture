from asyncio import Future
import json
from unittest.mock import MagicMock
from domain.users.models import User

from rest.dtos.apps import UpdateAppDto


def test_update_app_share_with_email(
    client_init, app_service, user_service, mock_find_email_user
):
    dto = UpdateAppDto(share_with_email="test@email.com")

    response = client_init.put("/apps/mock-id", data=json.dumps(dto.dict()))

    assert response.status_code == 200
    user_service.find_user.assert_called_once_with(email="test@email.com")
    app_service.share_app.assert_called_once_with("mock-id", mock_find_email_user)
