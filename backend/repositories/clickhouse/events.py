import logging
from typing import Dict
from fastapi import Depends
from pypika import Table, ClickHouseQuery, Parameter

from clickhouse import Clickhouse


class Events:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = Table("events")
        self.epoch_year = 1970

    def execute_get_query(self, query: str, parameters: Dict):
        logging.info(f"Executing query: {query}")
        query_result = self.clickhouse.client.query(query=query, parameters=parameters)
        logging.debug(f"Query Result: {query_result.result_set}")
        return query_result.result_set

    def get_unique_events(self, datasource_id: str):
        query, params = self.build_unique_events_query(datasource_id)
        return self.execute_get_query(query, params)

    def build_unique_events_query(self, datasource_id: str):
        params = {"ds_id": datasource_id}
        query = (
            ClickHouseQuery.from_(self.table)
            .where(self.table.datasource_id == Parameter("%(ds_id)s"))
            .where(self.table.event_name.not_like("%%/%%"))
            .where(self.table.event_name.not_like("%%?%%"))
            .select(self.table.event_name)
            .distinct()
        )
        return query.get_sql(), params
