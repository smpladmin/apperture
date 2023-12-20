import logging
import os
import time
import tempfile
from typing import List, Optional, Union

import boto3
import pymssql
import pymysql
import requests
import sshtunnel
from beanie import PydanticObjectId
from fastapi import Depends, UploadFile

from authorisation.models import IntegrationOAuth
from clickhouse.clickhouse_client_factory import ClickHouseClientFactory
from domain.apperture_users.models import AppertureUser
from domain.apps.models import App, ClickHouseCredential
from repositories.clickhouse.clickhouse_role import ClickHouseRole
from repositories.clickhouse.integrations import Integrations
from repositories.sql.mssql import MsSql
from repositories.sql.mysql import MySql
from repositories.sql.psql import PSql
from rest.dtos.integrations import DatabaseSSHCredentialDto

from .models import (
    BranchCredential,
    CdcCredential,
    Credential,
    CredentialType,
    CSVCredential,
    DatabaseSSHCredential,
    Integration,
    IntegrationProvider,
    MsSQLCredential,
    MySQLCredential,
    RelationalDatabaseType,
    ServerType,
)


class IntegrationService:
    def __init__(
        self,
        integrations: Integrations = Depends(),
        mssql: MsSql = Depends(),
        mysql: MySql = Depends(),
        psql: PSql = Depends(),
        clickhouse_role: ClickHouseRole = Depends(),
    ):
        self.integrations = integrations
        self.mssql = mssql
        self.mysql = mysql
        self.psql = psql
        self.db_client_map = {
            "mysql": self.mysql,
            "mssql": self.mssql,
            "psql": self.psql,
        }
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        self.s3_bucket_name = os.getenv("S3_BUCKET_NAME")
        self.clickhouse_role = clickhouse_role
        self.kafka_connector_base_url = os.getenv(
            "KAFKA_CONNECTOR_BASE_URL", "http://connect:8083/connectors/"
        )

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
        return await Integration.find(
            Integration.app_id == app_id, Integration.enabled != False
        ).to_list()

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
        mysql_credential: Optional[MySQLCredential],
        mssql_credential: Optional[MsSQLCredential],
        cdc_credential: Optional[CdcCredential],
        csv_credential: Optional[CSVCredential],
        branch_credential: Optional[BranchCredential],
        api_base_url: Optional[str] = None,
        tata_ivr_token: Optional[str] = None,
    ):
        if mysql_credential:
            credential_type = CredentialType.MYSQL
        elif mssql_credential:
            credential_type = CredentialType.MSSQL
        elif csv_credential:
            credential_type = CredentialType.CSV
        elif branch_credential:
            credential_type = CredentialType.BRANCH
        elif cdc_credential:
            credential_type = CredentialType.CDC
        elif tata_ivr_token:
            credential_type = CredentialType.TATA_IVR
        else:
            credential_type = CredentialType.API_KEY

        if provider == IntegrationProvider.SAMPLE:
            await self.clickhouse_role.create_sample_tables(
                [tableName], app.clickhouse_credential.databasename, app_id=str(app.id)
            )

        credential = Credential(
            type=credential_type,
            account_id=account_id,
            api_key=api_key,
            secret=secret,
            tableName=tableName,
            mysql_credential=mysql_credential,
            mssql_credential=mssql_credential,
            csv_credential=csv_credential,
            cdc_credential=cdc_credential,
            branch_credential=branch_credential,
            api_base_url=api_base_url,
            tata_ivr_token=tata_ivr_token,
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

    def build_branch_credential(self, app_id: str, branch_key: str, branch_secret: str):
        return BranchCredential(
            app_id=app_id, branch_key=branch_key, branch_secret=branch_secret
        )

    def build_cdc_credential(
        self,
        server: str,
        port: str,
        username: str,
        password: str,
        server_type: ServerType,
        database: str,
        tables: List[str],
    ):
        return CdcCredential(
            server=server,
            port=port,
            username=username,
            password=password,
            server_type=server_type,
            database=database,
            tables=tables,
        )

    def build_database_credential(
        self,
        host: str,
        port: str,
        username: str,
        password: str,
        databases: List[str],
        over_ssh: bool,
        database_type: RelationalDatabaseType,
        ssh_credential: Optional[DatabaseSSHCredentialDto],
    ) -> Union[MySQLCredential, MsSQLCredential]:
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
        if database_type == RelationalDatabaseType.MYSQL:
            return MySQLCredential(
                host=host,
                port=port,
                username=username,
                password=password,
                databases=databases,
                over_ssh=over_ssh,
                ssh_credential=db_ssh_credential,
            )
        elif database_type == RelationalDatabaseType.MSSQL:
            return MsSQLCredential(
                server=host,
                port=port,
                username=username,
                password=password,
                databases=databases,
                over_ssh=over_ssh,
                ssh_credential=db_ssh_credential,
            )

    def check_db_connection(
        self,
        host: str,
        port: str,
        username: str,
        password: str,
        database_type: RelationalDatabaseType,
    ):
        try:
            if database_type == RelationalDatabaseType.MYSQL:
                status = self.get_mysql_connection(
                    host=host, port=port, username=username, password=password
                )
            elif database_type == RelationalDatabaseType.MSSQL:
                status = self.get_mssql_connection(
                    host=host, port=port, username=username, password=password
                )
            return status

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

    def test_database_connection(
        self,
        host: str,
        port: str,
        username: str,
        password: str,
        database_type: RelationalDatabaseType,
        ssh_credential: Optional[DatabaseSSHCredentialDto],
    ):
        if ssh_credential:
            tunnel = self.create_ssh_tunnel(ssh_credential, host, port)
            if tunnel:
                with tunnel:
                    return self.check_db_connection(
                        host=tunnel.local_bind_host,
                        port=tunnel.local_bind_port,
                        username=username,
                        password=password,
                        database_type=database_type,
                    )
        else:
            return self.check_db_connection(
                host=host,
                port=port,
                username=username,
                password=password,
                database_type=database_type,
            )

    def get_mysql_connection(
        self, host: str, port: str, username: str, password: str
    ) -> bool:
        connection = pymysql.connect(
            host=host,
            port=int(port),
            user=username,
            password=password,
            ssl_verify_identity=True,
        )
        status = connection.open
        connection.close()
        return status

    def get_mssql_connection(self, host: str, port: str, username: str, password: str):
        connection = pymssql.connect(
            server=host,
            user=username,
            password=password,
        )
        status = connection._conn.connected
        connection.close()
        return status

    async def get_mysql_connection_details(self, id):
        integration = await self.get_integration(id)
        return integration.credential.mysql_credential

    async def get_mssql_connection_details(self, id):
        integration = await self.get_integration(id)
        return integration.credential.mssql_credential

    def upload_csv_to_s3(self, file: UploadFile, s3_key: str):
        self.s3_client.upload_fileobj(
            Fileobj=file.file, Bucket=self.s3_bucket_name, Key=s3_key
        )
        logging.info(f"File uploaded successfully: {s3_key}")

    def delete_file_from_s3(self, s3_key: str):
        self.s3_client.delete_object(Bucket=self.s3_bucket_name, Key=s3_key)

    async def create_clickhouse_table_from_csv(
        self,
        name: str,
        clickhouse_credential: ClickHouseCredential,
        s3_key: str,
        app_id: str,
    ):
        await self.integrations.create_table_from_csv(
            name=name,
            db_name=clickhouse_credential.databasename,
            s3_key=s3_key,
            app_id=app_id,
        )

    async def update_credentials(self, id: PydanticObjectId, credential: Credential):
        await Integration.find_one(
            Integration.id == id,
        ).update({"$set": {"credential": credential}})
        return

    async def get_integrations_with_cdc(self) -> List[Integration]:
        return await Integration.find(
            Integration.provider == IntegrationProvider.CDC
        ).to_list()

    def generate_create_table_query(
        self, table: str, database: str, table_description, server_type: ServerType
    ):
        prefix = f"CREATE TABLE IF NOT EXISTS {database}.{table} ("
        columns_query = ""
        key_column = None
        mapping = server_type.get_datatype_mapping()
        for i, column_description in enumerate(table_description):
            columns_query += f"{column_description[0]} "
            datatype = mapping[column_description[1].lower().split()[0].split("(")[0]]
            if not key_column:
                if datatype.startswith("Int"):
                    key_column = column_description
            columns_query += (
                f"Nullable({datatype}) " if column_description[2] else f"{datatype} "
            )
            columns_query += ","
        columns_query += "is_deleted UInt8, shard String"
        if key_column[2]:
            suffix = f") ENGINE = ReplacingMergeTree(is_deleted) ORDER BY (shard)"
        else:
            suffix = f") ENGINE = ReplacingMergeTree({key_column[0]}, is_deleted) ORDER BY ({key_column[0]}, shard)"

        return prefix + columns_query + suffix

    def create_ch_table(self, client, query: str):
        logging.info(f"Executing query: {query}")
        client.query(query=query)
        logging.info(f"Successfully created table.")

    def get_cdc_tables(
        self, connection, database, server_type: ServerType
    ) -> List[str]:
        client = self.db_client_map[server_type]
        return client.get_cdc_tables(connection=connection, database=database)

    def get_cdc_connection(
        self, host, port, username, password, database, server_type: ServerType
    ):
        client = self.db_client_map[server_type]
        return client.get_connection(
            host=host,
            port=port,
            username=username,
            password=password,
            database=database,
        )

    async def create_cdc_tables(
        self,
        cdc_credential: CdcCredential,
        app_id: str,
        ch_db: str,
    ):
        database = cdc_credential.database
        connection = self.get_cdc_connection(
            host=cdc_credential.server,
            port=cdc_credential.port,
            username=cdc_credential.username,
            password=cdc_credential.password,
            server_type=cdc_credential.server_type,
            database=database,
        )
        ch_client = await ClickHouseClientFactory.get_client(app_id=app_id)
        logging.info(
            f"Creating these cdc tables in clickhouse: {cdc_credential.tables}"
        )
        server_type = cdc_credential.server_type
        client = self.db_client_map[server_type]
        for table in cdc_credential.tables:
            logging.info(
                f"Creating {server_type} table {database}.{table} in {ch_db} database"
            )
            table_description = client.get_table_description(
                connection=connection, table_name=table, database=database
            )
            logging.info(f"Table description: {table_description}")
            create_query = self.generate_create_table_query(
                table=table,
                database=ch_db,
                table_description=table_description,
                server_type=server_type,
            )
            self.create_ch_table(client=ch_client, query=create_query)

    def generate_connector_config(
        self, tables: List[str], credential: CdcCredential, integration_id: str
    ):
        server_type = credential.server_type
        config = {
            "connector.class": credential.server_type.get_connector_class(),
            "database.hostname": credential.server,
            "database.port": credential.port,
            "database.user": credential.username,
            "database.password": credential.password,
            "topic.prefix": f"cdc_{integration_id}",
        }
        if server_type == ServerType.POSTGRESQL:
            config.update(
                {
                    "database.dbname": credential.database,
                    "table.include.list": ", ".join(
                        ["public." + table for table in tables]
                    ),
                    "publication.autocreate.mode": "filtered",
                    "plugin.name": "pgoutput",
                }
            )
        else:
            config.update(
                {
                    "database.names": credential.database,
                    "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
                    "schema.history.internal.kafka.topic": f"schemahistory.cdc_{integration_id}",
                }
            )
            if server_type == ServerType.MSSQL:
                config.update(
                    {
                        "table.include.list": ", ".join(
                            ["dbo." + table for table in tables]
                        ),
                        "database.encrypt": False,
                        "snapshot.mode": "initial",
                    }
                )
            elif server_type == ServerType.MYSQL:
                config.update(
                    {
                        "database.server.id": str(int(time.time())),
                        "include.schema.changes": "true",
                    }
                )
        return config

    def create_cdc_connector(
        self, tables: List[str], credential: CdcCredential, integration_id: str
    ):
        logging.info("Creating cdc connector")
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        config = self.generate_connector_config(
            tables=tables, credential=credential, integration_id=integration_id
        )
        data = {
            "name": f"cdc_{integration_id}",
            "config": config,
        }
        return requests.post(
            url=self.kafka_connector_base_url, json=data, headers=headers
        ).json()
