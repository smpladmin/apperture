from unittest.mock import AsyncMock, MagicMock, patch, ANY, Mock
from beanie import PydanticObjectId
import pytest
from domain.apps.models import App, ClickHouseCredential
from domain.common.models import IntegrationProvider
from domain.integrations.models import CredentialType, Integration
from domain.integrations.service import IntegrationService


class TestIntegrationService:
    def setup_method(self):
        App.get_settings = MagicMock()
        Integration.get_settings = MagicMock()
        Integration.insert = AsyncMock()
        self.host = "localhost"
        self.port = "3306"
        self.username = "admin"
        self.password = "password"
        self.integrations = MagicMock()
        self.service = IntegrationService(integrations=self.integrations)
        self.s3_client = MagicMock()
        self.file = MagicMock()

    @pytest.mark.asyncio
    async def test_create_integration(self):
        user_id = PydanticObjectId()
        app = App(name="Test App", user_id=user_id)
        app.id = PydanticObjectId()
        provider = IntegrationProvider.MIXPANEL
        account_id = "12020"
        api_key = "mock-api-key"
        secret = "mock-secret"
        tableName = ""

        integration = await self.service.create_integration(
            app, provider, account_id, api_key, secret, tableName, None, None
        )

        assert integration.user_id == user_id
        assert integration.app_id == app.id
        assert integration.provider == provider
        assert integration.credential.type == CredentialType.API_KEY
        assert integration.credential.account_id == account_id
        assert integration.credential.api_key == api_key
        assert integration.credential.secret == secret
        assert integration.insert.called
        integration.insert.assert_awaited_once()

    def test_mysql_connection_with_ssh_credentials(self):
        ssh_credential = MagicMock()
        ssh_credential.server = "ssh_server"
        ssh_credential.port = "22"
        ssh_credential.username = "ssh_username"
        ssh_credential.password = "ssh_password"
        ssh_credential.sshKey = "ssh_key_content"
        self.service.check_mysql_connection = MagicMock(return_value=True)

        with patch(
            "domain.integrations.service.sshtunnel.SSHTunnelForwarder"
        ) as mock_tunnel:
            mock_tunnel.return_value.__enter__.return_value.local_bind_host = (
                "localhost"
            )
            mock_tunnel.return_value.__enter__.return_value.local_bind_port = 1234

            with patch(
                "domain.integrations.service.tempfile.NamedTemporaryFile"
            ) as mock_temp_file:
                mock_temp_file.return_value.__enter__.return_value.name = (
                    "/tmp/temp_file"
                )
                self.service.create_temp_file = MagicMock(return_value="/tmp/temp_file")

                self.service.test_mysql_connection(
                    self.host, self.port, self.username, self.password, ssh_credential
                )

                mock_tunnel.assert_called_once_with(
                    ("ssh_server", 22),
                    ssh_pkey="/tmp/temp_file",
                    ssh_username="ssh_username",
                    ssh_password="ssh_password",
                    remote_bind_address=(self.host, int(self.port)),
                )
                self.service.create_temp_file.assert_called_once()

    def test_mysql_connection_without_ssh_credentials(self):
        ssh_credential = None

        with patch(
            "domain.integrations.service.IntegrationService.check_mysql_connection"
        ) as mock_check_mysql:
            expected_result = False
            mock_check_mysql.return_value = expected_result

            result = self.service.test_mysql_connection(
                self.host, self.port, self.username, self.password, ssh_credential
            )

            mock_check_mysql.assert_called_once_with(
                host=self.host,
                port=self.port,
                username=self.username,
                password=self.password,
            )

            assert result == expected_result

    def test_create_clickhouse_table_from_csv(self):
        self.integrations.create_table_from_csv.return_value = True
        self.service.create_clickhouse_table_from_csv(
            name="test",
            s3_key="/csvs/app-id/test.csv",
            clickhouse_credential=ClickHouseCredential(
                username="user", password="password", databasename="db"
            ),
        )
        self.integrations.create_table_from_csv.assert_called_once_with(
            **{
                "db_name": "db",
                "name": "test",
                "s3_key": "/csvs/app-id/test.csv",
            }
        )
