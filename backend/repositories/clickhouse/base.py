import logging
import traceback
from abc import ABC
from typing import Dict, Sequence, Union

from clickhouse_connect.driver.query import QueryResult
from fastapi import Depends, HTTPException
from pymysql import DatabaseError
from pypika import CustomFunction, Parameter, Table

from clickhouse import Clickhouse


class EventsBase(ABC):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = Table("events")
        self.click_stream_table = Table("clickstream")
        self.epoch_year = 1970
        self.date_format = "%Y-%m-%d"
        self.week_func = CustomFunction("WEEK", ["timestamp"])
        self.date_func = CustomFunction("DATE", ["timestamp"])
        self.json_extract_keys_func = CustomFunction("JSONExtractKeys", ["string"])
        self.json_extract_raw_func = CustomFunction("JSONExtractRaw", ["string"])
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
        self.convert_to_numeric_func = CustomFunction("toFloat64OrNull", ["string"])
        self.convert_to_string_func = CustomFunction("toString", ["string"])
        self.convert_to_bool_func = CustomFunction("toBool", ["string"])
        self.ch_match_func = CustomFunction("match", ["column", "term"])
        self.parse_datetime_best_effort = CustomFunction(
            "parseDateTimeBestEffort", ["string"]
        )
        self.convert_to_unix_timestamp_func = CustomFunction(
            "toUnixTimestamp", ["datetime"]
        )
        self.to_start_of_interval_func = CustomFunction(
            "toStartOfInterval", ["timestamp", "interval"]
        )
        self.date_diff_func = CustomFunction(
            "dateDiff", ["granularity", "date1", "date2"]
        )
        self.visit_param_extract_string = CustomFunction(
            "visitParamExtractString", ["json", "field"]
        )

    def execute_get_query(self, query: str, parameters: Dict) -> Sequence:
        logging.info(f"Executing query: {query}")
        logging.info(f"Parameters: {parameters}")
        try:
            query_result = self.clickhouse.client.query(
                query=query, parameters=parameters
            )
            return query_result.result_set
        except Exception as e:
            logging.info(repr(e))
            traceback.print_exc()
            return []

    def execute_query_for_restricted_client(
        self,
        query: str,
        username: str,
        password: str,
        parameters: Union[Dict, None] = None,
    ) -> Union[QueryResult, None]:
        try:
            params = parameters if parameters else {}
            restricted_client = self.clickhouse.get_connection_for_user(
                username=username, password=password
            )
            result = restricted_client.query(query=query, parameters=params)
            logging.info(f"Successfully executed query: {query}")
            restricted_client.close()
            return result
        except Exception as e:
            logging.info(repr(e))
            traceback.print_exc()
            raise HTTPException(status_code=400, detail=str(e))

    def kill_query(self, id: str):
        try:
            query = f"KILL query WHERE query_id ='{id}'"
            logging.info(query)
            self.clickhouse.admin.query(query=query)
        except Exception as e:
            logging.info(repr(e))
