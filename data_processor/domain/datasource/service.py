import os
import logging
import requests

from domain.datasource.models import DataSourceResponse


class DataSourceService:
    def get_datasource_with_credential(self, id: str) -> DataSourceResponse:
        logging.info("{x}: {y}".format(x='get_datasource_with_credential', y='starts'))
        logging.info("{x}: {y}".format(x='Getting datasource details for id', y=id))

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
        logging.info("{x}: {y}".format(x='get_datasource_with_credential', y='ends'))
        return ds
