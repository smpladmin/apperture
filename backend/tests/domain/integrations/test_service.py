from unittest.mock import ANY, AsyncMock, MagicMock, patch

import pytest
from beanie import PydanticObjectId

from domain.apps.models import App, ClickHouseCredential
from domain.common.models import IntegrationProvider
from domain.integrations.models import (
    CredentialType,
    Integration,
    RelationalDatabaseType,
    CdcCredential,
    ServerType,
)
from domain.integrations.service import IntegrationService


class TestIntegrationService:
    def setup_method(self):
        App.get_settings = MagicMock()
        Integration.get_settings = MagicMock()
        Integration.insert = AsyncMock()
        self.host = "localhost"
        self.app_id = "test-app-id"
        self.port = "3306"
        self.username = "admin"
        self.password = "password"
        self.integrations = MagicMock()
        self.service = IntegrationService(integrations=self.integrations)
        self.s3_client = MagicMock()
        self.file = MagicMock()
        self.tables = ["test_table_1", "test_table_2"]
        self.integration_id = "test_id"

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
            app,
            provider,
            account_id,
            api_key,
            secret,
            tableName,
            None,
            None,
            None,
            None,
            None,
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

                self.service.test_database_connection(
                    self.host,
                    self.port,
                    self.username,
                    self.password,
                    RelationalDatabaseType.MYSQL,
                    ssh_credential,
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
            "domain.integrations.service.IntegrationService.check_db_connection"
        ) as mock_check_database:
            expected_result = False
            mock_check_database.return_value = expected_result

            result = self.service.test_database_connection(
                self.host,
                self.port,
                self.username,
                self.password,
                RelationalDatabaseType.MYSQL,
                ssh_credential,
            )

            mock_check_database.assert_called_once_with(
                host=self.host,
                port=self.port,
                username=self.username,
                password=self.password,
                database_type=RelationalDatabaseType.MYSQL,
            )

            assert result == expected_result

    @pytest.mark.asyncio
    async def test_create_clickhouse_table_from_csv(self):
        self.integrations.create_table_from_csv = AsyncMock(return_value=True)
        await self.service.create_clickhouse_table_from_csv(
            app_id=self.app_id,
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
            },
            app_id="test-app-id"
        )

    @pytest.mark.parametrize(
        "credential, config",
        [
            (
                CdcCredential(
                    server="server",
                    port="port",
                    username="user",
                    password="password",
                    server_type="mysql",
                    database="cdc",
                    tables=[],
                ),
                {
                    "connector.class": "io.debezium.connector.mysql.MySqlConnector",
                    "database.hostname": "server",
                    "database.port": "port",
                    "database.user": "user",
                    "database.password": "password",
                    "topic.prefix": "cdc_test_id",
                    "database.names": "cdc",
                    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
                    "schema.history.internal.kafka.topic": "schemahistory.cdc_test_id",
                    "database.server.id": ANY,
                    "include.schema.changes": "true",
                },
            ),
            (
                CdcCredential(
                    server="server",
                    port="port",
                    username="user",
                    password="password",
                    server_type="mssql",
                    database="cdc",
                    tables=[],
                ),
                {
                    "connector.class": "io.debezium.connector.sqlserver.SqlServerConnector",
                    "database.hostname": "server",
                    "database.port": "port",
                    "database.user": "user",
                    "database.password": "password",
                    "topic.prefix": "cdc_test_id",
                    "database.names": "cdc",
                    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
                    "schema.history.internal.kafka.topic": "schemahistory.cdc_test_id",
                    "table.include.list": "dbo.test_table_1, dbo.test_table_2",
                    "database.encrypt": False,
                    "snapshot.mode": "initial",
                    "snapshot.isolation.mode": "snapshot",
                    "snapshot.lock.timeout.ms": "50000",
                },
            ),
            (
                CdcCredential(
                    server="server",
                    port="port",
                    username="user",
                    password="password",
                    server_type="psql",
                    database="cdc",
                    tables=[],
                ),
                {
                    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
                    "database.hostname": "server",
                    "database.port": "port",
                    "database.user": "user",
                    "database.password": "password",
                    "topic.prefix": "cdc_test_id",
                    "database.dbname": "cdc",
                    "table.include.list": "public.test_table_1, public.test_table_2",
                    "publication.autocreate.mode": "filtered",
                    "plugin.name": "pgoutput",
                },
            ),
        ],
    )
    def test_generate_connector_config(self, credential, config):
        assert (
            self.service.generate_connector_config(
                tables=self.tables,
                credential=credential,
                integration_id=self.integration_id,
            )
            == config
        )

    @pytest.mark.parametrize(
        "server_type, table_description",
        [
            (
                ServerType.MYSQL,
                [
                    ["column1", "int", 0],
                    ["column2", "varchar", 1],
                    ["column3", "time", 0],
                ],
            ),
            (
                ServerType.MSSQL,
                [
                    ["column1", "int", 0],
                    ["column2", "text", 1],
                    ["column3", "datetime", 0],
                ],
            ),
            (
                ServerType.POSTGRESQL,
                [
                    ["column1", "integer", 0],
                    ["column2", "character", 1],
                    ["column3", "date", 0],
                ],
            ),
        ],
    )
    def test_generate_create_table_query(self, server_type, table_description):
        assert (
            self.service.generate_create_table_query(
                table="cdc_table",
                database="cdc",
                table_description=table_description,
                server_type=server_type,
            )
            == "CREATE TABLE IF NOT EXISTS cdc.cdc_table (column1 Int32 ,column2 Nullable(String) ,column3 Int64 ,is_deleted UInt8, shard String) ENGINE = ReplacingMergeTree(column1, is_deleted) ORDER BY (column1, shard)"
        )
