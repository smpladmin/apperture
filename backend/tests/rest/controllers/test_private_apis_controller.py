import json


def test_update_events(client_init, events_data):
    response = client_init.post("/private/events", data=json.dumps(events_data))
    assert response.status_code == 200
