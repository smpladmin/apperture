import json


def test_get_user(client_init, user_service, user_data, queried_user_property):
    response = client_init.get("/user/property", data=json.dumps(user_data))
    print(response.json)
    assert response.status_code == 200
    # assert response.json == queried_user_property
