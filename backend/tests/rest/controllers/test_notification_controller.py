import json


def filter_response(res):
    to_drop = ["revisionId", "createdAt", "updatedAt"]
    return {k: v for k, v in res.items() if k not in to_drop}


def test_get_notification(client_init, notification_response):
    response = client_init.get("/notifications/?name=name")
    assert response.status_code == 200
    assert response.json().keys() == notification_response.keys()
    assert filter_response(response.json()) == filter_response(notification_response)


def test_add_notification(client_init, notification_data, notification_response):
    response = client_init.post("/notifications", data=json.dumps(notification_data))
    assert response.status_code == 200
    assert response.json().keys() == notification_response.keys()
    assert filter_response(response.json()) == filter_response(notification_response)


def test_update_notification(client_init, notification_data, notification_response):
    response = client_init.put("/notifications/635ba034807ab86d8a2aadd8", data=json.dumps(notification_data))
    assert response.status_code == 200
    assert response.json().keys() == notification_response.keys()
    assert filter_response(response.json()) == filter_response(notification_response)
