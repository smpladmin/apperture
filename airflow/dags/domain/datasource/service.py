import logging
from typing import List

from domain.datasource.models import DataSource
from domain.datasource.models import DataSourceResponse
from apperture.backend_action import get


class DataSourceService:
    def get_datasource_with_credential(self, id: str) -> DataSourceResponse:
        logging.info("{x}: {y}".format(x="get_datasource_with_credential", y="starts"))
        logging.info("{x}: {y}".format(x="Getting datasource details for id", y=id))

        res = get(path=f"/private/datasources/{id}")
        ds_response = res.json()
        ds = DataSourceResponse(**ds_response)
        logging.info("{x}: {y}".format(x="get_datasource_with_credential", y="ends"))
        return ds

    def get_datasource_ids_for_provider(self, provider: str) -> List:
        logging.info("{x}: {y}".format(x="get_datasources_for_provider", y="starts"))

        res = get(path=f"/private/datasources?provider={provider}")
        ds_list = res.json()
        logging.info("{x}: {y}".format(x="get_datasource_with_credential", y="ends"))
        return [ds["_id"] for ds in ds_list]

    def get_events(self, datasource: DataSource):
        logging.info(
            "{x}: {y}".format(x="Requesting events for datasource", y=datasource.id)
        )
        response = get(path=f"/private/integrations/{datasource.id}/events")
        logging.info("{x}: {y}".format(x="Receieved events:", y=response.status_code))
        return response.json()
