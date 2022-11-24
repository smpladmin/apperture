import logging
from typing import Dict
from pypika import Table
from fastapi import Depends

from clickhouse import Clickhouse


class Events:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = Table("events")
        self.epoch_year = 1970

    def execute_get_query(self, query: str, parameters: Dict):
        logging.info(f"Executing query: {query}")
        query_result = self.clickhouse.client.query(query=query, parameters=parameters)
        logging.info(f"Query Result: {query_result.result_set}")
        return query_result.result_set
