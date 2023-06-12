import logging
from datetime import datetime

import numpy as np
from typing import List

from beanie import PydanticObjectId
from beanie.odm.operators.update.general import Set
from fastapi import Depends

from domain.properties.models import Property, Properties, PropertyDataType
from mongo import Mongo
from repositories.clickhouse.events import Events


class PropertiesService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
        events: Events = Depends(),
    ):
        self.mongo = mongo
        self.events = events

    def validate_properties(self, all_props: List[str], date: str, ds_id: str):
        value_counts = np.array(
            self.events.get_distinct_values_for_properties(
                all_props=all_props, ds_id=ds_id, date=date
            )[0]
        )
        all_props = np.array(all_props)
        return (all_props[value_counts > 1]).tolist()

    async def refresh_properties(self, ds_id: str) -> Properties:
        [(all_properties, date)] = self.events.get_event_properties(datasource_id=ds_id)
        valid_props = self.validate_properties(
            all_props=all_properties, date=date, ds_id=ds_id
        )
        props = [
            Property(name=prop, type=PropertyDataType.DEFAULT) for prop in valid_props
        ]
        properties_obj = Properties(
            datasource_id=PydanticObjectId(ds_id),
            properties=props,
        )
        await Properties.find_one(
            Properties.datasource_id == PydanticObjectId(ds_id)
        ).upsert(
            Set(
                {Properties.properties: props, Properties.updated_at: datetime.utcnow()}
            ),
            on_insert=properties_obj,
        )
        return properties_obj

    async def refresh_properties_for_all_datasources(self):
        ds_ids = self.events.get_all_datasources()
        for ds_id in ds_ids:
            logging.info(f"Refreshing properties for: {ds_id[0]}")
            props = await self.refresh_properties(ds_id=ds_id[0])
            logging.info(f"New properties: {props}")

    async def fetch_properties(self, ds_id: str) -> List[str]:
        properties = await Properties.find_one(
            Properties.datasource_id == PydanticObjectId(ds_id)
        )
        return [prop.name for prop in properties.properties] if properties else []
