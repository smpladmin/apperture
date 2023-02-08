import logging
from fastapi import Depends
from typing import Dict, List
from repositories.clickhouse.clickstream import Clickstream
from datetime import datetime
from clickhouse.clickhouse import Clickhouse
from domain.elements.service import ElementsService
from domain.elements.models import Element
from domain.clickstream.models import CaptureEvent, ClickstreamData


class ClickstreamService:
    def __init__(
        self,
        clickhouse: Clickhouse = Depends(),
        clickstream: Clickstream = Depends(),
        elements_service: ElementsService = Depends(),
    ):
        self.clickhouse = clickhouse.client
        self.clickstream = clickstream
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

    def build_element_chain(self, elements, event):
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
