import logging
import os

import logfire

import clickhouse_connect
from beanie import PydanticObjectId

from domain.apps.models import App
from settings import apperture_settings

apperture_settings = apperture_settings()


class ClickHouseClient:
    def __init__(self, app: App):
        self.app = app

        self.connection = clickhouse_connect.get_client(
            host=app.remote_connection.host if app.remote_connection else "clickhouse",
            port=app.remote_connection.port if app.remote_connection else 0,
            username=app.remote_connection.username if app.remote_connection else None,
            password=app.remote_connection.password if app.remote_connection else "",
            allow_experimental_object_type=1,
            query_limit=0,
            max_execution_time=apperture_settings.clickhouse_max_execution_time_seconds,
        )

        self.admin_connection = (
            self.connection
            if app.remote_connection
            else clickhouse_connect.get_client(
                host="clickhouse",
                port=0,
                username=os.getenv("CHDB_ADMIN_USERNAME", "clickhouse_admin"),
                password=os.getenv("CHDB_ADMIN_PASSWORD", "password"),
                allow_experimental_object_type=1,
                query_limit=0,
                max_execution_time=apperture_settings.clickhouse_max_execution_time_seconds,
            )
        )
        self.restricted_connection = None

    def resticted_client_query(self, query, parameters={}, settings={}):
        if not self.restricted_connection:
            self.restricted_connection = clickhouse_connect.get_client(
                host=self.app.remote_connection.host
                if self.app.remote_connection
                else "clickhouse",
                port=self.app.remote_connection.port
                if self.app.remote_connection
                else 0,
                username=self.app.clickhouse_credential.username
                if self.app.clickhouse_credential
                and self.app.clickhouse_credential.username
                else None,
                password=self.app.clickhouse_credential.password
                if self.app.clickhouse_credential
                and self.app.clickhouse_credential.password
                else "",
                allow_experimental_object_type=1,
                query_limit=0,
                max_execution_time=apperture_settings.clickhouse_max_execution_time_seconds,
            )
        return self.restricted_connection.query(
            query=query, parameters=parameters, settings=settings
        )

    def admin_query(self, query, parameters={}, settings={}):
        return self.admin_connection.query(
            query=query, parameters=parameters, settings=settings
        )

    def query(self, query, parameters={}, settings={}):
        return self.connection.query(
            query=query, parameters=parameters, settings=settings
        )

    def close(self):
        self.connection.close()
        self.admin_connection.close()
        self.restricted_connection.close()


class ClickHouseClientFactory:
    __clients = {}

    def __init__(self):
        if ClickHouseClientFactory.__clients:
            return
        ClickHouseClientFactory.__clients = {
            "default": clickhouse_connect.get_client(
                host="clickhouse",
                allow_experimental_object_type=1,
                query_limit=0,
                max_execution_time=apperture_settings.clickhouse_max_execution_time_seconds,
            )
        }

    @staticmethod
    async def get_client(app_id, read=False) -> ClickHouseClient:
        read_key = f"read_{app_id}"

        if (
            app_id not in ClickHouseClientFactory.__clients
            or read_key not in ClickHouseClientFactory.__clients
        ):
            with logfire.span(f"Creating new connection for the app {app_id}"):
                apps = await App.find(App.id == PydanticObjectId(app_id)).to_list()
                app = apps[0]

                ClickHouseClientFactory.__clients[read_key] = ClickHouseClient(app)
                ClickHouseClientFactory.__clients[app_id] = ClickHouseClient(app)
        if read:
            with logfire.span(f"Using read-only connection"):
                return ClickHouseClientFactory.__clients[read_key]
        with logfire.span(f"Using default connection"):
            return ClickHouseClientFactory.__clients[app_id]

    @staticmethod
    def close_all_client_connection():
        for app_id, client in (ClickHouseClientFactory.__clients).items():
            logging.info(f"Closing client connection for: % {app_id}")
            client.close()
        logging.info("All connections closed")
