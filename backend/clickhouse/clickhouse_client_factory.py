import logging
from typing import Union

import clickhouse_connect
from beanie import PydanticObjectId

from domain.apps.models import App, ClickHouseCredential
from settings import apperture_settings

settings = apperture_settings()


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
            max_execution_time=settings.clickhouse_max_execution_time_seconds,
        )

        self.admin_connection = (
            self.connection
            if app.remote_connection
            else clickhouse_connect.get_client(
                host=app.remote_connection.host
                if app.remote_connection
                else "clickhouse",
                port=app.remote_connection.port if app.remote_connection else 0,
                username=app.remote_connection.username
                if app.remote_connection
                else None,
                password=app.remote_connection.password
                if app.remote_connection
                else "",
                allow_experimental_object_type=1,
                query_limit=0,
                max_execution_time=settings.clickhouse_max_execution_time_seconds,
            )
        )
        self.restricted_connection = clickhouse_connect.get_client(
            host=app.remote_connection.host if app.remote_connection else "clickhouse",
            port=app.remote_connection.port if app.remote_connection else 0,
            username=app.clickhouse_credential.username
            if app.clickhouse_credential and app.clickhouse_credential.username
            else None,
            password=app.clickhouse_credential.password
            if app.clickhouse_credential and app.clickhouse_credential.password
            else "",
            allow_experimental_object_type=1,
            query_limit=0,
            max_execution_time=settings.clickhouse_max_execution_time_seconds,
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
                max_execution_time=settings.clickhouse_max_execution_time_seconds,
            )
        }
        logging.info(ClickHouseClientFactory.__clients)

    @staticmethod
    async def get_client(app_id) -> ClickHouseClient:
        if app_id not in ClickHouseClientFactory.__clients:
            logging.info(f"NEW client created:  % {app_id}")
            apps = await App.find(App.id == PydanticObjectId(app_id)).to_list()
            logging.info(f"App: {app}")
            app = apps[0]

            ClickHouseClientFactory.__clients[app_id] = ClickHouseClient(app)
        logging.info(f"Returning client for:  % {app_id}")
        return ClickHouseClientFactory.__clients[app_id]

    @staticmethod
    def close_all_client_connection():
        for app_id, client in (ClickHouseClientFactory.__clients).items():
            print(f"Closing client connection for: % {app_id}")
            client.close()
        print("All connections closed")
