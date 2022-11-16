import json


def test_update_events(client_init, events_data):
    data = [list(d.values()) for d in events_data]
    response = client_init.post("/private/events", data=json.dumps(data))
    print(response.content)
    assert response.status_code == 200
