import logging
from typing import Dict
from pypika import Table, CustomFunction, Parameter
from fastapi import Depends

from clickhouse import Clickhouse


class Events:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = Table("events")
        self.epoch_year = 1970
        self.week_func = CustomFunction("WEEK", ["timestamp"])
        self.date_func = CustomFunction("DATE", ["timestamp"])
        self.event_criterion = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            self.table.event_name == Parameter("%(event_name)s"),
            self.date_func(self.table.timestamp) >= Parameter("%(start_date)s"),
            self.date_func(self.table.timestamp) <= Parameter("%(end_date)s"),
        ]
        self.total_criterion = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            self.date_func(self.table.timestamp) >= Parameter("%(start_date)s"),
            self.date_func(self.table.timestamp) <= Parameter("%(end_date)s"),
        ]

    def execute_get_query(self, query: str, parameters: Dict):
        logging.info(f"Executing query: {query}")
        logging.info(f"Parameters: {parameters}")
        query_result = self.clickhouse.client.query(query=query, parameters=parameters)
        logging.info(f"Query Result: {query_result.result_set}")
        return query_result.result_set
