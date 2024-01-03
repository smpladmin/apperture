import json
from tests.utils import filter_response


def test_save_alerts(client_init, alert_service, alert_data, alert_response):
    response = client_init.post("/alerts", data=json.dumps(alert_data))
    assert response.status_code == 200
    assert filter_response(response.json()) == alert_response
    alert_service.save_alert_config.assert_called_once()


def test_update_alerts(client_init, alert_service, alert_data, alert_response):
    response = client_init.put(
        "/alerts/6595348f0b3ea77062d31ab1", data=json.dumps(alert_data)
    )
    assert response.status_code == 200
    assert filter_response(response.json()) == alert_response
    alert_service.update_alert_config.assert_called_once()
