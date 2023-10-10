from unittest.mock import patch, Mock


def test_generate_api_key(client_init, apperture_user_service):
    uuid_mock = Mock()
    mock_uuid = "mock-uuid"
    uuid_mock.return_value = mock_uuid

    with patch("uuid.uuid4", uuid_mock):
        response = client_init.post("/api-key")
        assert response.status_code == 200
        assert response.json() == "mock-uuid"
        apperture_user_service.update_api_key.assert_called_with(
            user_id="mock-user-id", api_key="mock-uuid"
        )
