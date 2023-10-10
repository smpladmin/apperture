import os
import logging
from typing import List
from dotenv import load_dotenv

import requests

from domain.datasource.models import DataSourceResponse

load_dotenv(override=False)


class DataSourceService:
    def get_datasource_with_credential(self, id: str) -> DataSourceResponse:
        logging.info("{x}: {y}".format(x="get_datasource_with_credential", y="starts"))
        logging.info("{x}: {y}".format(x="Getting datasource details for id", y=id))

        res = requests.get(
            f"{os.getenv('BACKEND_BASE_URL')}/private/datasources/{id}",
            headers={
                f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv(
                    "BACKEND_API_KEY_SECRET"
                )
            },
        )
        ds_response = res.json()
        ds = DataSourceResponse(**ds_response)
        logging.info("{x}: {y}".format(x="get_datasource_with_credential", y="ends"))
        return ds

    def get_datasource_ids_for_provider(self, provider: str) -> List:
        logging.info("{x}: {y}".format(x="get_datasources_for_provider", y="starts"))

        res = requests.get(
            f"{os.getenv('BACKEND_BASE_URL')}/private/datasources?provider={provider}",
            headers={
                f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv(
                    "BACKEND_API_KEY_SECRET"
                )
            },
        )
        ds_list = res.json()
        logging.info("{x}: {y}".format(x="get_datasource_with_credential", y="ends"))
        return [ds["_id"] for ds in ds_list]
