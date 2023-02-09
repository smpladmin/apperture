import json
from datetime import datetime
from unittest.mock import ANY

from rest.dtos.events import CreateEventDto
from domain.common.models import IntegrationProvider


def test_update_events(client_init, events_service, events_data):
    data = [list(d.values()) for d in events_data]
    response = client_init.post("/private/events", data=json.dumps(data))
    assert response.status_code == 200
    events_service.update_events.assert_called_once_with(
        [
            CreateEventDto(
                datasourceId="1234",
                timestamp=datetime(2019, 1, 1, 0, 0),
                provider=IntegrationProvider.MIXPANEL,
                userId="123",
                eventName="event_a",
                properties={},
            ),
            CreateEventDto(
                datasourceId="1234",
                timestamp=datetime(2019, 1, 1, 0, 0),
                provider=IntegrationProvider.MIXPANEL,
                userId="123",
                eventName="event_b",
                properties={"a": "b", "b": "c"},
            ),
        ],
    )


def test_refresh_properties(client_init, properties_service):
    response = client_init.put("/private/properties?ds_id=635ba034807ab86d8a2aadd9")
    assert response.status_code == 200
    assert response.json() == {
        "_id": None,
        "createdAt": ANY,
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "properties": [
            {"name": "prop1", "type": "default"},
            {"name": "prop2", "type": "default"},
        ],
        "revisionId": ANY,
        "updatedAt": None,
    }
    properties_service.refresh_properties.assert_called_once_with(
        **{"ds_id": "635ba034807ab86d8a2aadd9"}
    )

    response1 = client_init.put("/private/properties")
    assert response1.status_code == 200
    properties_service.refresh_properties_for_all_datasources.assert_called_once()


def test_update_events_from_clickstream(client_init, action_service):
    response = client_init.post(
        "/private/click_stream?datasource_id=63e4da53370789982002e57d"
    )
    assert response.status_code == 200
    assert response.json() == {"updated": "63e4da53370789982002e57d"}
    action_service.update_events_from_clickstream.assert_called_once_with(
        **{"datasource_id": "63e4da53370789982002e57d"}
    )
