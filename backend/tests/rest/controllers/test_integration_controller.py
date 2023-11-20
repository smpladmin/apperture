import asyncio
import json
from unittest.mock import ANY

from domain.apps.models import ClickHouseCredential
from domain.common.models import IntegrationProvider
from domain.integrations.models import (
    Credential,
    CredentialType,
    CSVCredential,
    Integration,
    MySQLCredential,
    RelationalDatabaseType,
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
                csv_credential=None,
                mysql_credential=MySQLCredential(
                    host="127.0.0.1",
                    port="3306",
                    username="test-user",
                    password="password",
                    databases=["test-db"],
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
                "databases": ["test-db"],
                "port": "3306",
                "ssh_credential": None,
                "username": "test-user",
            },
            "mssql_credential": None,
            "cdc_credential": None,
            "refresh_token": None,
            "secret": None,
            "tableName": None,
            "type": "MYSQL",
            "csv_credential": None,
            "api_base_url": None,
            "branch_credential": None,
            "facebook_ads_credential": None,
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
        "enabled": None,
    }


def test_check_database_connection(
    client_init, integration_service, database_credential_data
):
    response = client_init.post(
        "/integrations/database/test",
        data=json.dumps(database_credential_data),
    )
    assert response.status_code == 200
    assert response.json() == True
    integration_service.test_database_connection.assert_called_once_with(
        **{
            "host": "127.0.0.1",
            "password": "password",
            "port": "3306",
            "username": "test-user",
            "ssh_credential": None,
            "database_type": RelationalDatabaseType.MYSQL,
        }
    )


def test_add_csv_integration(
    client_init,
    csv_integration_data,
    integration_response,
    integration_service,
    files_service,
):
    integration_future = asyncio.Future()
    integration_future.set_result(
        Integration(
            app_id="636a1c61d715ca6baae65611",
            user_id="636a1c61d715ca6baae65611",
            provider=IntegrationProvider.CSV,
            credential=Credential(
                type=CredentialType.CSV,
                api_key=None,
                account_id=None,
                secret=None,
                tableName=None,
                csv_credential=CSVCredential(
                    name="test.csv",
                    s3_key="/csv/636a1c61d715ca6baae65611/test.csv",
                    table_name="test",
                ),
                mysql_credential=None,
            ),
        )
    )
    integration_service.create_integration.return_value = integration_future
    response = client_init.post(
        "/integrations?create_datasource=true&trigger_data_processor=false",
        data=json.dumps(csv_integration_data),
    )
    assert response.status_code == 200
    assert response.json() == {
        "_id": None,
        "appId": "636a1c61d715ca6baae65611",
        "createdAt": ANY,
        "credential": {
            "account_id": None,
            "api_key": None,
            "mysql_credential": None,
            "mssql_credential": None,
            "cdc_credential": None,
            "refresh_token": None,
            "secret": None,
            "tableName": None,
            "type": "CSV",
            "csv_credential": {
                "name": "test.csv",
                "s3_key": "/csv/636a1c61d715ca6baae65611/test.csv",
                "table_name": "test",
            },
            "api_base_url": None,
            "branch_credential": None,
            "facebook_ads_credential": None,
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
        "provider": "csv",
        "revisionId": None,
        "updatedAt": None,
        "userId": "636a1c61d715ca6baae65611",
        "enabled": None,
    }


def test_upload_csv(client_init, integration_service, files_service):
    sample_file = "tests/rest/controllers/test.csv"
    response = client_init.post(
        "/integrations/csv/upload",
        files={"file": (sample_file, open(sample_file, "rb"))},
        data={"appId": "636a1c61d715ca6baae65611"},
    )
    assert response.status_code == 200
    assert response.json() == {
        "_id": None,
        "app_id": "636a1c61d715ca6baae65611",
        "created_at": ANY,
        "enabled": True,
        "filename": "test.csv",
        "filetype": "csv",
        "revision_id": None,
        "s3_key": "/csv/636a1c61d715ca6baae65611/test.csv",
        "table_name": "test",
        "updated_at": None,
    }
    files_service.build_s3_key.assert_called_once_with(
        **{
            "app_id": "636a1c61d715ca6baae65611",
            "filename": "tests/rest/controllers/test.csv",
        }
    )
    integration_service.upload_csv_to_s3.assert_called_once_with(
        **{"file": ANY, "s3_key": "/csv/636a1c61d715ca6baae65611/test.csv"}
    )


def test_create_table_with_csv(client_init, integration_service, files_service):
    response = client_init.post(
        "/integrations/csv/create",
        json={
            "datasourceId": "636a1c61d715ca6baae65611",
            "fileId": "636a1c61d715ca6baae65611",
        },
    )
    assert response.status_code == 200
    files_service.get_file.assert_called_once_with(**{"id": "636a1c61d715ca6baae65611"})
    integration_service.create_clickhouse_table_from_csv.assert_called_once_with(
        **{
            "clickhouse_credential": ClickHouseCredential(
                username="test_username",
                password="test_password",
                databasename="test_database",
            ),
            "name": "test",
            "s3_key": "/csv/636a1c61d715ca6baae65611/test.csv",
        }
    )
