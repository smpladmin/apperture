from typing import List

from beanie import PydanticObjectId
from fastapi import Depends
from datetime import datetime


from domain.segments.models import (
    SegmentGroup,
    ComputedSegment,
    Segment,
)
from mongo import Mongo
from repositories.clickhouse.segments import Segments


class SegmentService:
    def __init__(
        self,
        segments: Segments = Depends(),
        mongo: Mongo = Depends(),
    ):
        self.segments = segments
        self.mongo = mongo

    async def compute_segment(
        self,
        datasource_id: str,
        groups: List[SegmentGroup],
        columns: List[str],
    ) -> ComputedSegment:
        segment, count = self.segments.get_segment_data(
            datasource_id=datasource_id,
            groups=groups,
            columns=columns,
        )
        return ComputedSegment(count=count, data=segment)

    async def build_segment(
        self,
        datasourceId: PydanticObjectId,
        appId: PydanticObjectId,
        userId: PydanticObjectId,
        name: str,
        description: str,
        groups: List[SegmentGroup],
        columns: List[str],
    ):
        return Segment(
            datasource_id=datasourceId,
            app_id=appId,
            user_id=userId,
            name=name,
            description=description,
            groups=groups,
            columns=columns,
        )

    async def add_segment(self, segment: Segment):
        segment.updated_at = segment.created_at
        return await Segment.insert(segment)

    async def get_segment(self, segment_id: str) -> Segment:
        return await Segment.get(PydanticObjectId(segment_id))

    async def get_segments_for_app(self, app_id: str) -> List[Segment]:
        return await Segment.find(Segment.app_id == PydanticObjectId(app_id)).to_list()

    async def get_segments_for_user(self, user_id: str) -> List[Segment]:
        return await Segment.find(
            Segment.user_id == PydanticObjectId(user_id)
        ).to_list()

    async def update_segment(self, segment_id: str, new_segment: Segment):
        to_update = new_segment.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()

        await Segment.find_one(
            Segment.id == PydanticObjectId(segment_id),
        ).update({"$set": to_update})
