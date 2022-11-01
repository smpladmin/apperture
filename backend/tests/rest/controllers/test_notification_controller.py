from fastapi.testclient import TestClient


def test_get_notification(app_init, notification_response):
    print("Running tests")
    test_client = TestClient(app_init)
    response = test_client.get("/notifications/?name=name")
    assert response.status_code == 200
    assert response.json().keys() == notification_response.keys()
