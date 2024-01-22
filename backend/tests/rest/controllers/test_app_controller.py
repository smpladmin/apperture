import json
from unittest.mock import Mock, patch

from rest.dtos.apps import UpdateAppDto


def test_update_app_share_with_email(
    client_init, app_service, apperture_user_service, mock_find_email_user, mock_user_id
):
    dto = UpdateAppDto(share_with_email="test@email.com")

    response = client_init.put("/apps/mock-id", data=json.dumps(dto.dict()))

    assert response.status_code == 200
    # apperture_user_service.get_user_by_email.assert_called_with(email="test@email.com")
    # app_service.share_app.assert_called_once_with(
    #     "mock-id", mock_user_id, mock_find_email_user
    # )


def test_generate_api_key(client_init, app_service):
    uuid_mock = Mock()
    mock_uuid = "mock-uuid"
    mock_id = "mock-app-id"
    uuid_mock.return_value = mock_uuid

    with patch("uuid.uuid4", uuid_mock):
        response = client_init.post(f"/apps/{mock_id}/api-key")
        assert response.status_code == 200
        assert response.json() == "mock-uuid"
        app_service.update_api_key.assert_called_with(
            app_id="mock-app-id", api_key="mock-uuid"
        )
