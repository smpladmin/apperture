import logging
from typing import Optional
import mysql.connector

from beanie import PydanticObjectId
from authorisation.models import IntegrationOAuth
from domain.apps.models import App
from rest.dtos.integrations import DatabaseSSHCredentialDto
from domain.apperture_users.models import AppertureUser
from .models import (
    Credential,
    CredentialType,
    Integration,
    IntegrationProvider,
    MySQLCredential,
    DatabaseSSHCredential,
)


class IntegrationService:
    async def create_oauth_integration(
        self,
        user: AppertureUser,
        app: App,
        provider: IntegrationProvider,
        integration_oauth: IntegrationOAuth,
    ):
        credential = Credential(
            type=CredentialType.OAUTH,
            account_id=integration_oauth.account_id,
            refresh_token=integration_oauth.refresh_token,
        )
        integration = Integration(
            user_id=user.id,
            app_id=app.id,
            provider=provider,
            credential=credential,
        )
        await integration.insert()
        return integration

    async def get_user_integration(self, id: str, user_id: str) -> Integration:
        return await Integration.find_one(
            Integration.id == PydanticObjectId(id),
            Integration.user_id == PydanticObjectId(user_id),
        )

    async def get_app_integrations(self, app_id: PydanticObjectId) -> list[Integration]:
        return await Integration.find(Integration.app_id == app_id).to_list()

    async def get_integration(self, id: str) -> Integration:
        return await Integration.get(id)

    async def create_integration(
        self,
        app: App,
        provider: IntegrationProvider,
        account_id: Optional[str],
        api_key: Optional[str],
        secret: Optional[str],
        mysql_credential: Optional[MySQLCredential],
    ):
        credential_type = (
            CredentialType.MYSQL if mysql_credential else CredentialType.API_KEY
        )
        credential = Credential(
            type=credential_type,
            account_id=account_id,
            api_key=api_key,
            secret=secret,
            mysql_credential=mysql_credential,
        )
        integration = Integration(
            user_id=app.user_id,
            app_id=app.id,
            provider=provider,
            credential=credential,
        )
        await integration.insert()
        return integration

    def build_database_ssh_credential(
        self,
        server: str,
        port: str,
        username: Optional[str],
        password: Optional[str],
        ssh_key: Optional[str],
    ):
        return DatabaseSSHCredential(
            server=server,
            port=port,
            username=username,
            password=password,
            ssh_key=ssh_key,
        )

    def build_mysql_credential(
        self,
        host: str,
        port: str,
        username: str,
        password: str,
        over_ssh: bool,
        ssh_credential: Optional[DatabaseSSHCredentialDto],
    ):
        db_ssh_credential = (
            self.build_database_ssh_credential(
                server=ssh_credential.server,
                port=ssh_credential.port,
                username=ssh_credential.username,
                password=ssh_credential.password,
                ssh_key=ssh_credential.sshKey,
            )
            if ssh_credential
            else None
        )
        return MySQLCredential(
            host=host,
            port=port,
            username=username,
            password=password,
            over_ssh=over_ssh,
            ssh_credential=db_ssh_credential,
        )

    def test_mysql_connection(
        self, host: str, port: str, username: str, password: str
    ):
        connection_successful = False
        try:
            # Establish a connection to the MySQL server
            connection = mysql.connector.connect(
                host=host,
                port=port,
                user=username,
                password=password,
            )

            # Check if the connection was successful
            if connection.is_connected():
                connection_successful = True
                logging.info("Connected to MySQL database")

            # Close the connection
            connection.close()
            logging.info("Connection closed")

        except mysql.connector.Error as error:
            logging.info(f"Failed to connect to MySQL database: {error}")

        return connection_successful
