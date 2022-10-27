def test_get_notification(client_init, notification_response):

    response = client_init.get("/notifications/?name=name")
    assert response.status_code == 200
    assert response.json().keys() == notification_response.keys()
