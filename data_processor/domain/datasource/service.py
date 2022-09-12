import requests

from domain.datasource.models import DataSourceResponse


class DataSourceService:
    def get_datasource_with_credential(self, id: str) -> DataSourceResponse:
        res = requests.get(
            f"http://backend:8001/private/datasources/{id}",
            headers={"apperture-api-key": "aeb47e74a662452451c25ad604937597"},
        )
        ds_response = res.json()
        ds = DataSourceResponse(**ds_response)
        return ds
