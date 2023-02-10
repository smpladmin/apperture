import json


def test_add_integration_with_datasource(
    client_init, integration_data, integration_response
):
    response = client_init.post(
        "/integrations?create_datasource=true&trigger_data_processor=false",
        data=json.dumps(integration_data),
    )
    assert response.status_code == 200
    assert response.json() == integration_response


def test_add_integration_with_datasource_with_trigger_data_processor(
    client_init, integration_data, integration_response, runlog_service, dpq_service
):
    response = client_init.post(
        "/integrations?create_datasource=true&trigger_data_processor=true",
        data=json.dumps(integration_data),
    )
    assert response.status_code == 200
    runlog_service.create_runlogs.assert_called_once()
    dpq_service.enqueue_from_runlogs.assert_called_once()
    assert response.json() == integration_response
