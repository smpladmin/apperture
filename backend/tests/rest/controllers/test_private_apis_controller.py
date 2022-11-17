import json
from datetime import datetime

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
