from typing import List

import logfire
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

    async def get_session_data_by_id(
        self, dsId: str, interval: int, user_id: str, app_id: str
    ):
        query = f"""
            select user_id,properties.$session_id session_id,min(timestamp+ interval 330 minute)  timestamp_ist
            from default.clickstream 
            where datasource_id = '{dsId}'
                and timestamp_ist>= today() - interval {interval} day
                and user_id in ({user_id})
                group by 1,2
            order by 3 desc
        """
        with logfire.span(f"executing query for session details"):
            result = await self.execute_query_for_app(
                query=query, parameters={}, app_id=app_id, read=True
            )
        return result

    async def get_utm_data_by_id(
        self, dsId: str, interval: int, user_id: str, app_id: str
    ):
        query = f"""
            SELECT
                toDate(timestamp+ interval 330 minute) timestamp_ist,
                user_id,
                extractURLParameter(properties, 'utm_source') AS utm_source,
                extractURLParameter(properties, 'utm_medium') AS utm_medium,
                extractURLParameter(properties, 'utm_campaign') AS utm_campaign
            FROM default.clickstream
            WHERE datasource_id = '{dsId}'
            AND timestamp_ist>= today() - interval {interval} day
            AND properties ilike '%utm%'
            and user_id in ({user_id})
            group by all
        """
        with logfire.span(f"executing query for session details"):
            result = await self.execute_query_for_app(
                query=query, parameters={}, app_id=app_id, read=True
            )
        return result

    async def get_user_data_by_id(self, dsId: str, interval: int, user_id: str, app_id: str,service:str) -> List[any]:
        query = f"""
            SELECT 
                splitByString('{service}',replaceAll(splitByChar('?', url)[1], '?', ''))[2] AS truncated_url, count(*) as activity_tally
            FROM 
                sangeetha_user_report
            WHERE toDate(timestamp) BETWEEN yesterday() - {interval-1} AND today()
                AND url LIKE '%{service}%' AND user_id = '{user_id}' 
            GROUP BY 1
            ORDER BY 2 desc
        """
        with logfire.span(f"executing query for {service} details"):
            result= await self.execute_query_for_app(
                query=query, parameters={}, app_id=app_id,read=True
            )
        return result

    async def execute_test_query(self,query:str,app_id:str):
        result = await self.execute_query_for_app(
            query=query, parameters={}, app_id=app_id, read=True
        )
        return result
