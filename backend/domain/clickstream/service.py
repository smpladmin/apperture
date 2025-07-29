import json
import logging
from datetime import datetime
from typing import Dict, List
import urllib.parse
from fastapi import Depends
from starlette.concurrency import run_in_threadpool

from clickhouse.clickhouse import Clickhouse
from clickhouse.clickhouse_client_factory import ClickHouseClientFactory
from domain.clickstream.models import (
    ClickstreamData,
    ClickstreamResult,
    ComputedStreamElementProperty,
    ComputedStreamEvent,
)
from domain.common.models import CaptureEvent
from domain.elements.models import Element
from domain.elements.service import ElementsService
from repositories.clickhouse.clickstream import Clickstream


class ClickstreamService:
    def __init__(
        self,
        clickhouse: Clickhouse = Depends(),
        clickstream: Clickstream = Depends(),
        elements_service: ElementsService = Depends(),
    ):
        self.clickhouse = clickhouse.client
        self.repository = clickstream
        self.table = "clickstream"
        self.error_table = "errorstream"
        self.elements_service = elements_service
        self.columns = [
            "datasource_id",
            "timestamp",
            "user_id",
            "element_chain",
            "event",
            "properties",
        ]

    def build_element_chain(self, properties_elements, event):
        elements = [
            Element(
                text=element_dict.get("$el_text"),
                tag_name=element_dict.get("tag_name"),
                href=element_dict.get("attr__href"),
                attr_id=element_dict.get("attr__id"),
                attr_class=element_dict.get("classes"),
                nth_child=element_dict.get("nth_child"),
                nth_of_type=element_dict.get("nth_of_type"),
                attributes=element_dict.get("attributes", {}),
            )
            for element_dict in properties_elements
        ]
        return self.elements_service.elements_to_string(elements=elements)

    def build_clickstream_data(
        self,
        datasource_id: str,
        timestamp: str,
        user_id: str,
        event: str,
        properties: Dict,
    ):
        element_chain = (
            self.build_element_chain(properties["$elements"], event)
            if event == CaptureEvent.AUTOCAPTURE
            else ""
        )
        return ClickstreamData(
            datasourceId=datasource_id,
            timestamp=datetime.fromtimestamp(timestamp),
            userId=user_id,
            element_chain=element_chain,
            event=event,
            properties=properties,
        )

    async def update_events(self, datasource_id: str, events: List[Dict], app_id: str):
        clickstream_data = [
            self.build_clickstream_data(
                datasource_id=datasource_id,
                timestamp=event["properties"]["$time"],
                user_id=event["properties"]["$device_id"],
                event=event["event"],
                properties=event["properties"],
            )
            for event in events
        ]
        client = await ClickHouseClientFactory.get_client(app_id)
        try:
            client.connection.insert(
                self.table,
                clickstream_data,
                column_names=self.columns,
                settings={"insert_async": True, "wait_for_async_insert": False},
            )
        except Exception as e:
            logging.error(e)
            logging.info("Error inserting")
            logging.info(clickstream_data)
            client.connection.insert(
                self.error_table,
                [
                    (
                        data.datasourceId,
                        data.timestamp,
                        data.userId,
                        data.event,
                        str(data.properties),
                    )
                    for data in clickstream_data
                ],
                column_names=self.columns,
            )

    async def get_data_by_id(self, dsId: str, app_id: str):
        data_list = await self.repository.get_all_data_by_dsId(dsId, app_id=app_id)
        data_list = [
            ClickstreamResult(
                event=ComputedStreamEvent(
                    name=name,
                    type=type,
                    elements=ComputedStreamElementProperty(
                        href=href[0] if href else "",
                        text=text[0] if text else "",
                        tag_name=tag_name[0] if tag_name else "",
                    ),
                ),
                timestamp=timestamp,
                uid=uid,
                url=url,
                source=source,
            )
            for (
                name,
                timestamp,
                uid,
                url,
                source,
                type,
                tag_name,
                text,
                href,
            ) in data_list
        ]
        count = await self.repository.get_stream_count_by_dsId(dsId=dsId, app_id=app_id)
        return {"count": count[0][0], "data": data_list}

    async def test_query(
            self,
            app_id:str,
            query:str,
    ):
        return await self.repository.execute_test_query(query=query,app_id=app_id)

    async def get_user_data_by_id(
        self, dsId: str, interval: int, app_id: str, user_id: str
    ):
        search_result = await self.repository.get_user_data_by_id(
            dsId=dsId,
            interval=interval,
            user_id=user_id,
            app_id=app_id,
            service="/search-result/",
        )
        browse_result = await self.repository.get_user_data_by_id(
            dsId=dsId,
            interval=interval,
            user_id=user_id,
            app_id=app_id,
            service="/product-details/",
        )
        search_result = {urllib.parse.unquote(key): value for key, value in search_result}
        browse_result = {urllib.parse.unquote(key): value for key, value in browse_result}
        return {
            "project_id": dsId,
            "user_id": user_id,
            "interval": interval,
            "product_searched": search_result,
            "product_browsed": browse_result,
        }

    async def get_user_data_by_id_2(
        self, dsId: str, interval: int, app_id: str, user_id: str
    ):
        search_result = await self.repository.get_user_data_by_id(
            dsId=dsId,
            interval=interval,
            user_id=user_id,
            app_id=app_id,
            service="/search-result/",
        )
        browse_result = await self.repository.get_user_data_by_id(
            dsId=dsId,
            interval=interval,
            user_id=user_id,
            app_id=app_id,
            service="/product-details/",
        )
        utm_result = await self.repository.get_utm_data_by_id(
            dsId=dsId, interval=interval, user_id=user_id, app_id=app_id
        )
        session_result = await self.repository.get_session_data_by_id(
            dsId=dsId, interval=interval, user_id=user_id, app_id=app_id
        )
        search_result = {
            urllib.parse.unquote(key): value for key, value in search_result
        }
        browse_result = {
            urllib.parse.unquote(key): value for key, value in browse_result
        }
        logging.info(f"UTM RESULT: {utm_result}")
        logging.info(f"SESSION RESULT: {session_result}")
        return {
            "project_id": dsId,
            "user_id": user_id,
            "interval": interval,
            "product_searched": search_result,
            "product_browsed": browse_result,
            "utm_data": utm_result,
            "session_data": session_result,
        }
