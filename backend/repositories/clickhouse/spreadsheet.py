import logging
from typing import Union

import clickhouse_connect
from fastapi import Depends

from clickhouse.clickhouse import Clickhouse
from repositories.clickhouse.base import EventsBase
from repositories.clickhouse.parser.query_parser import QueryParser


class Spreadsheets(EventsBase):
    def __init__(
        self,
        clickhouse: Clickhouse = Depends(),
        parser: QueryParser = Depends(),
    ):
        super().__init__(clickhouse=clickhouse)
        self.parser = parser

    def get_connection_for_user(self, username: str, password: str):
        return clickhouse_connect.get_client(
            host="clickhouse",
            allow_experimental_object_type=1,
            query_limit=0,
            username=username,
            password=password,
        )

    def get_transient_spreadsheet(
        self,
        query: str,
        username: Union[str, None],
        password: Union[str, None],
    ):
        query = self.parser.assign_query_limit(query)
        restricted_client = self.get_connection_for_user(
            username=username, password=password
        )
        result = restricted_client.query(query=query)
        logging.info(query)
        restricted_client.close()
        return result
