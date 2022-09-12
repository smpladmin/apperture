import os
import requests

from domain.datasource.models import DataSourceResponse


class DataSourceService:
    def get_datasource_with_credential(self, id: str) -> DataSourceResponse:
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
        return ds
