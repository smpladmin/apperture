import logging
from datetime import datetime
from typing import Dict, List

from fastapi import Depends

from clickhouse.clickhouse import Clickhouse
from domain.clickstream.models import CaptureEvent, ClickstreamData, ClickstreamResult
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
                href=element_dict.get("href"),
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

    async def update_events(
        self,
        datasource_id: str,
        timestamp: str,
        user_id: str,
        event: str,
        properties: Dict,
    ):
        clickstream_data = self.build_clickstream_data(
            datasource_id=datasource_id,
            timestamp=timestamp,
            user_id=user_id,
            event=event,
            properties=properties,
        )

        self.clickhouse.insert(
            self.table,
            [clickstream_data],
            column_names=self.columns,
        )

    def get_data_by_id(self, dsId: str):
        data_list = self.repository.get_all_data_by_dsId(dsId)
        data_list = [
            ClickstreamResult(
                event=data[0],
                timestamp=data[1],
                uid=data[2],
                url=data[3].get("$current_url", None),
                source=data[3].get("$lib", None),
            )
            for data in data_list
        ]
        count = self.repository.get_stream_count_by_dsId(dsId)
        return {"count": count[0][0], "data": data_list}
