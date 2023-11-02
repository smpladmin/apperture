import logging

import clickhouse_connect
from beanie import PydanticObjectId

from domain.apps.models import App, ClickHouseCredential
from settings import apperture_settings

settings = apperture_settings()


class ClickHouseClient:
    def __init__(self, app_id, host, port, user, password):
        self.app_id = app_id

        self.connection = clickhouse_connect.get_client(
            host=host,
            username=user,
            password=password,
            allow_experimental_object_type=1,
            query_limit=0,
            max_execution_time=settings.clickhouse_max_execution_time_seconds,
            port=port,
        )

    def query(self, query, params={}, settings={}):
        return self.connection.query(query=query, parameters=params, settings=settings)

    def close(self):
        self.connection.close()


class ClickHouseClientFactory:
    __clients = {}
    __restricted_clients = {}
    __credentials = {}

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
    async def get_app_connection_creds(app_id: str):
        results = await App.find(App.id == PydanticObjectId(app_id)).to_list()
        credentials = (
            results[0].clickhouse_credential
            if results
            and results[0].clickhouse_credential
            and results[0].clickhouse_credential
            else None
        )
        if credentials and not credentials.remote_connection:
            ClickHouseClientFactory.__credentials[app_id] = credentials
            ClickHouseClientFactory.__clients[
                app_id
            ] = ClickHouseClientFactory.__clients["default"]
        elif not credentials:
            logging.info("Using default credentials")
            ClickHouseClientFactory.__credentials[app_id] = "default"
            ClickHouseClientFactory.__clients[
                app_id
            ] = ClickHouseClientFactory.__clients["default"]
        else:
            ClickHouseClientFactory.__credentials[app_id] = credentials

            print(ClickHouseClientFactory.__credentials)

    @staticmethod
    async def get_client(app_id) -> ClickHouseClient:
        if app_id not in ClickHouseClientFactory.__credentials:
            await ClickHouseClientFactory.get_app_connection_creds(app_id)

        if app_id not in ClickHouseClientFactory.__clients:
            logging.info(f"NEW client created:  % {app_id}")
            credentials = ClickHouseClientFactory.__credentials[
                app_id
            ].remote_connection

            ClickHouseClientFactory.__clients[app_id] = ClickHouseClient(
                app_id=app_id,
                host=credentials.host,
                port=credentials.port,
                user=credentials.username,
                password=credentials.password,
            )
        logging.info(f"Returning client for:  % {app_id}")
        return ClickHouseClientFactory.__clients[app_id]

    @staticmethod
    async def get_restricted_client(app_id) -> ClickHouseClient:
        print(ClickHouseClientFactory.__credentials)
        if app_id not in ClickHouseClientFactory.__credentials:
            await ClickHouseClientFactory.get_app_connection_creds(app_id)

        if app_id not in ClickHouseClientFactory.__restricted_clients:
            logging.info(f"NEW restricted client created:  % {app_id}")
            credentials = ClickHouseClientFactory.__credentials[app_id]

            ClickHouseClientFactory.__restricted_clients[app_id] = ClickHouseClient(
                app_id=app_id,
                host=credentials.remote_connection.host
                if credentials.remote_connection
                else "clickhouse",
                port=credentials.remote_connection.port
                if credentials.remote_connection
                else 8123,
                user=credentials.username,
                password=credentials.password,
            )
        logging.info(f"Returning restricted client for:  % {app_id}")
        return ClickHouseClientFactory.__restricted_clients[app_id]

    @staticmethod
    def close_all_client_connection():
        for app_id, client in (ClickHouseClientFactory.__clients).items():
            print(f"Closing client connection for: % {app_id}")
            client.close()
        print("All connections closed")
