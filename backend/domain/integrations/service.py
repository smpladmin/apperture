import logging
import os
import tempfile
from typing import Optional

import boto3
import pymysql
import sshtunnel
from beanie import PydanticObjectId
from fastapi import Depends, UploadFile

from authorisation.models import IntegrationOAuth
from domain.apperture_users.models import AppertureUser
from domain.apps.models import App, ClickHouseCredential
from repositories.clickhouse.integrations import Integrations
from rest.dtos.integrations import DatabaseSSHCredentialDto

from .models import (
    Credential,
    CredentialType,
    CSVCredential,
    DatabaseSSHCredential,
    Integration,
    IntegrationProvider,
    MySQLCredential,
)


class IntegrationService:
    def __init__(self, integrations: Integrations = Depends()):
        self.integrations = integrations
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        self.s3_bucket_name = os.getenv("S3_BUCKET_NAME")

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
        tableName: Optional[str],
        database: Optional[str],
        mysql_credential: Optional[MySQLCredential],
        csv_credential: Optional[CSVCredential],
    ):
        if mysql_credential:
            credential_type = CredentialType.MYSQL
        elif csv_credential:
            credential_type = CredentialType.CSV
        else:
            credential_type = CredentialType.API_KEY

        credential = Credential(
            type=credential_type,
            account_id=account_id,
            api_key=api_key,
            secret=secret,
            tableName=tableName,
            mysql_credential=mysql_credential,
            csv_credential=csv_credential,
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

    def check_mysql_connection(
        self, host: str, port: str, username: str, password: str
    ):
        try:
            connection = self.get_mysql_connection(
                host=host, port=port, username=username, password=password
            )
            with connection:
                if connection.open:
                    return True

        except Exception as e:
            logging.info(f"Failed to connect to MySQL database with exception: {e}")

        return False

    def create_temp_file(self, content: str):
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(content.encode("utf-8"))
        temp_file.flush()
        return temp_file.name

    def create_ssh_tunnel(
        self, ssh_credential: DatabaseSSHCredentialDto, host: str, port: str
    ):
        logging.info("SSH credentials exist")
        ssh_pkey = None
        if ssh_credential.sshKey:
            logging.info("SSH key exists, creating temp file to store ssh key")
            ssh_pkey = self.create_temp_file(ssh_credential.sshKey)
            logging.info(f"Temporary file name: {ssh_pkey}")

        try:
            tunnel = sshtunnel.SSHTunnelForwarder(
                (ssh_credential.server, int(ssh_credential.port)),
                ssh_pkey=ssh_pkey,
                ssh_username=ssh_credential.username,
                ssh_password=ssh_credential.password,
                remote_bind_address=(host, int(port)),
            )
            tunnel.start()
            logging.info(
                f"Created SSH tunnel, binding ({host, port}) to ({tunnel.local_bind_host, tunnel.local_bind_port})"
            )
            return tunnel
        except Exception as e:
            logging.info(f"Connection failed with exception: {e}")
            return None

    def test_mysql_connection(
        self,
        host: str,
        port: str,
        username: str,
        password: str,
        ssh_credential: Optional[DatabaseSSHCredentialDto],
    ):
        if ssh_credential:
            tunnel = self.create_ssh_tunnel(ssh_credential, host, port)
            if tunnel:
                with tunnel:
                    return self.check_mysql_connection(
                        host=tunnel.local_bind_host,
                        port=tunnel.local_bind_port,
                        username=username,
                        password=password,
                    )
        else:
            return self.check_mysql_connection(
                host=host, port=port, username=username, password=password
            )

    def get_mysql_connection(self, host, port, username, password, database=None):
        return (
            pymysql.connect(
                host=host,
                port=int(port),
                user=username,
                password=password,
                database=database,
            )
            if database
            else pymysql.connect(
                host=host,
                port=int(port),
                user=username,
                password=password,
            )
        )

    async def get_mysql_connection_details(self, id):
        integration = await self.get_integration(id)
        return integration.credential.mysql_credential

    def upload_csv_to_s3(self, file: UploadFile, s3_key: str):
        self.s3_client.upload_fileobj(
            Fileobj=file.file, Bucket=self.s3_bucket_name, Key=s3_key
        )
        logging.info(f"File uploaded successfully: {s3_key}")

    def delete_file_from_s3(self, s3_key: str):
        self.s3_client.delete_object(Bucket=self.s3_bucket_name, Key=s3_key)

    def create_clickhouse_table_from_csv(
        self, name: str, clickhouse_credential: ClickHouseCredential, s3_key: str
    ):
        self.integrations.create_table_from_csv(
            name=name,
            db_name=clickhouse_credential.databasename,
            s3_key=s3_key,
        )
