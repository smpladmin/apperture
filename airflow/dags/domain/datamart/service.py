import logging
from typing import List, Union

from domain.datasource.models import (
    ClickHouseCredential,
    DatabaseClient,
    MsSQLCredential,
    MySQLCredential,
)
from apperture.backend_action import get, post
from .models import Datamart


class DatamartService:
    def get_datamarts(self) -> List[Datamart]:
        logging.info("{x}: {y}".format(x="get all datamarts", y=""))
        response = get(
            "/private/datamart",
        )
        datamart_list = response.json()
        return [Datamart(**ds) for ds in datamart_list]

    def refresh_datamart(
        self,
        datamart_id: str,
        app_id: str,
        database_client: DatabaseClient,
        database_credential: Union[
            MySQLCredential, MsSQLCredential, ClickHouseCredential
        ],
    ):
        logging.info("{x}: {y}".format(x="refresh datamart", y="start"))
        try:
            logging.info(f"database credential, {database_credential}")
            response = post(
                path="/private/datamart/refresh",
                json={
                    "datamartId": datamart_id,
                    "appId": app_id,
                    "databaseClient": database_client,
                    "databaseCredential": database_credential.dict(),
                },
            )
            if response.status_code != 200:
                raise Exception(f"Error: {response.json()}")

        except:
            raise Exception(f"Could not refresh datamart for : {datamart_id}")
        logging.info("{x}: {y}".format(x="refresh datamart", y="end"))

    def push_datamart_to_target(self, datamart_id: str, target: str):
        logging.info("{x}: {y}".format(x="push datamart to google sheet", y="start"))
        try:
            response = post(
                path="/private/{datamart_id}?target={target}",
                json={
                    "datamartId": datamart_id,
                },
            )
            if response.status_code != 200:
                raise Exception(f"Error: {response.json()}")
        except:
            raise Exception(f"Could not push datamart: {datamart_id} to google sheet")
        logging.info("{x}: {y}".format(x="push datamart to google sheet", y="end"))
