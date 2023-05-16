from typing import List

from pypika import ClickHouseQuery, Parameter, Order, Interval, Criterion
from pypika import functions as fn

from repositories.clickhouse.base import EventsBase


class Clickstream(EventsBase):
    """
    @param dsId:dataSource ID
    Takes in a datasource id of an apperture provider
    @returns list of events
    """

    def get_all_data_by_dsId(self, dsId: str) -> List[any]:
        query, parameters = self.build_get_all_events_query(dsId)
        return self.execute_get_query(query, parameters)

    def get_stream_count_by_dsId(self, dsId: str):
        query, parameters = self.build_count_all_events_query(dsId)
        return self.execute_get_query(query, parameters)

    def build_get_all_events_query(self, dsId: str):
        parameters = {"dsId": dsId}
        criterion = [self.click_stream_table.datasource_id == Parameter("%(dsId)s"),
                     self.click_stream_table.timestamp <= fn.Now()]
        query = (
            ClickHouseQuery.from_(self.click_stream_table)
            .select(
                self.click_stream_table.event,
                self.click_stream_table.timestamp,
                self.click_stream_table.user_id,
                self.to_json_string_func(self.table.properties)
            )
            .where(Criterion.all(criterion))
            .orderby(self.click_stream_table.timestamp, order=Order.desc)
        ).limit(100)

        return query.get_sql(), parameters

    def build_count_all_events_query(self, dsId: str):
        parameters = {"dsId": dsId}
        query = (
            ClickHouseQuery.from_(self.click_stream_table)
            .select(fn.Count("*"))
            .where(self.click_stream_table.datasource_id == Parameter("%(dsId)s"))
        )

        return query.get_sql(), parameters
