import logging
from typing import List

from requests import post
from apperture.backend_action import get
from .models import Datamart


class DatamartService:
    def get_datamarts(self) -> List[Datamart]:
        logging.info("{x}: {y}".format(x="get all datamarts", y=""))
        response = get(
            "/private/datamart",
        )
        datamart_list = response.json()
        return [Datamart(**ds) for ds in datamart_list]

    def refresh_datamart(self, datamart_id: str):
        logging.info("{x}: {y}".format(x="refresh datamart", y="start"))
        try:
            post("/private/datamart", {"datamartId": datamart_id})
        except:
            raise Exception(f"Could not refresh datamart for : {datamart_id}")
        logging.info("{x}: {y}".format(x="refresh datamart", y="end"))
