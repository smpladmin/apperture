import asyncio
import json
from unittest.mock import ANY

from domain.common.models import IntegrationProvider
from domain.integrations.models import (
    Integration,
    Credential,
    CredentialType,
    MySQLCredential,
)


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


def test_add_database_integration(
    client_init, database_integration_data, integration_response, integration_service
):
    integration_future = asyncio.Future()
    integration_future.set_result(
        Integration(
            app_id="636a1c61d715ca6baae65611",
            user_id="636a1c61d715ca6baae65611",
            provider=IntegrationProvider.MYSQL,
            credential=Credential(
                type=CredentialType.MYSQL,
                api_key=None,
                account_id=None,
                secret=None,
                tableName=None,
                mysql_credential=MySQLCredential(
                    host="127.0.0.1",
                    port="3306",
                    username="test-user",
                    password="password",
                    ssh_credential=None,
                ),
            ),
        )
    )
    integration_service.create_integration.return_value = integration_future
    response = client_init.post(
        "/integrations?create_datasource=true&trigger_data_processor=false",
        data=json.dumps(database_integration_data),
    )
    assert response.status_code == 200
    assert response.json() == {
        "_id": None,
        "appId": "636a1c61d715ca6baae65611",
        "createdAt": ANY,
        "credential": {
            "account_id": None,
            "api_key": None,
            "mysql_credential": {
                "host": "127.0.0.1",
                "over_ssh": False,
                "password": "password",
                "port": "3306",
                "ssh_credential": None,
                "username": "test-user",
            },
            "refresh_token": None,
            "secret": None,
            "tableName": None,
            "type": "MYSQL",
        },
        "datasource": {
            "_id": "636a1c61d715ca6baae65611",
            "appId": "636a1c61d715ca6baae65611",
            "createdAt": ANY,
            "enabled": True,
            "externalSourceId": "123",
            "integrationId": "636a1c61d715ca6baae65611",
            "name": None,
            "provider": "apperture",
            "revisionId": None,
            "updatedAt": None,
            "userId": "636a1c61d715ca6baae65611",
            "version": "DEFAULT",
        },
        "provider": "mysql",
        "revisionId": None,
        "updatedAt": None,
        "userId": "636a1c61d715ca6baae65611",
    }


def test_check_database_connection(
    client_init, integration_service, database_credential_data
):
    response = client_init.post(
        "/integrations/mysql/test",
        data=json.dumps(database_credential_data),
    )
    assert response.status_code == 200
    assert response.json() == True
    integration_service.test_mysql_connection.assert_called_once_with(
        **{
            "host": "127.0.0.1",
            "password": "password",
            "port": "3306",
            "username": "test-user",
            "ssh_credential": None,
        }
    )
