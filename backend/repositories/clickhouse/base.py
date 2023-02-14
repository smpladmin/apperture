from abc import ABC
import logging
from typing import Dict
from fastapi import Depends
from pypika import (
    Table,
    Parameter,
    CustomFunction,
)

from clickhouse import Clickhouse


class EventsBase(ABC):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = Table("events")
        self.click_stream_table = Table("clickstream")
        self.epoch_year = 1970
        self.week_func = CustomFunction("WEEK", ["timestamp"])
        self.date_func = CustomFunction("DATE", ["timestamp"])
        self.json_extract_keys_func = CustomFunction("JSONExtractKeys", ["string"])
        self.to_json_string_func = CustomFunction("toJSONString", ["json"])
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
        self.convert_to_float_func = CustomFunction("toFloat64OrDefault", ["string"])
        self.convert_to_bool_func = CustomFunction("toBool", ["string"])
        self.ch_match_func = CustomFunction("match", ["column", "term"])
        self.parse_datetime_best_effort = CustomFunction(
            "parseDateTimeBestEffort", ["string"]
        )

    def execute_get_query(self, query: str, parameters: Dict):
        logging.info(f"Executing query: {query}")
        logging.info(f"Parameters: {parameters}")
        try:
            query_result = self.clickhouse.client.query(
                query=query, parameters=parameters
            )
            return query_result.result_set
        except Exception as e:
            logging.info(e)
            return []
