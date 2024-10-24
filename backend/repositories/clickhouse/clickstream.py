from typing import List

from pypika import ClickHouseQuery, Criterion, Field, Order, Parameter
from pypika import functions as fn

from repositories.clickhouse.base import EventsBase


class Clickstream(EventsBase):
    """
    @param dsId:dataSource ID
    Takes in a datasource id of an apperture provider
    @returns list of events
    """

    async def get_all_data_by_dsId(self, dsId: str, app_id: str) -> List[any]:
        query, parameters = self.build_get_all_events_query(dsId)
        return await self.execute_query_for_app(
            query=query, parameters=parameters, app_id=app_id
        )

    async def get_stream_count_by_dsId(self, dsId: str, app_id: str):
        query, parameters = self.build_count_all_events_query(dsId)
        return await self.execute_query_for_app(
            query=query, parameters=parameters, app_id=app_id
        )

    def build_get_all_events_query(self, dsId: str):
        parameters = {"dsId": dsId}
        criterion = [
            self.click_stream_table.datasource_id == Parameter("%(dsId)s"),
            self.click_stream_table.timestamp <= fn.Now(),
        ]
        query = (
            ClickHouseQuery.from_(self.click_stream_table)
            .select(
                self.click_stream_table.event,
                self.click_stream_table.timestamp,
                self.click_stream_table.user_id,
                Field(f"properties.$current_url"),
                Field(f"properties.$lib"),
                Field("properties.$event_type"),
                Field("properties.$elements.tag_name"),
                Field("properties.$elements.$el_text"),
                Field("properties.$elements.attr__href"),
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

    async def get_user_data_by_id(self, dsId: str, interval: int, user_id: str, app_id: str,service:str) -> List[any]:
        query = f"""
            SELECT 
                splitByString('{service}',replaceAll(splitByChar('?', properties.8)[1], '?', ''))[2] AS truncated_url, count(*) as activity_tally
            FROM 
                default.clickstream
            WHERE 
                datasource_id = '{dsId}'
                AND toDate(timestamp) BETWEEN yesterday() - {interval-1} AND today()
                AND properties.8 LIKE '%{service}%' AND user_id = '{user_id}' 
            GROUP BY 1
            ORDER BY 2 desc
        """
        result= await self.execute_query_for_app(
            query=query, parameters={}, app_id=app_id
        )
        return result
