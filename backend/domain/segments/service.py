from typing import List

from beanie import PydanticObjectId
from fastapi import Depends
from domain.segments.models import (
    SegmentGroup,
    SegmentFilterConditions,
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
        group_conditions: List[SegmentFilterConditions],
    ) -> ComputedSegment:
        segment = self.segments.get_segment(
            datasource_id=datasource_id,
            groups=groups,
            columns=columns,
            group_conditions=group_conditions,
        )
        n = 100 if len(segment) > 100 else len(segment)

        columns.insert(0, "user_id")
        data = [dict(zip(columns, row)) for row in segment]
        return ComputedSegment(count=len(segment), data=data[:n])

    async def build_segment(
        self,
        datasourceId: PydanticObjectId,
        appId: PydanticObjectId,
        userId: PydanticObjectId,
        name: str,
        description: str,
        groups: List[SegmentGroup],
        groupConditions: List[SegmentFilterConditions],
        columns: List[str],
    ):
        return Segment(
            datasource_id=datasourceId,
            app_id=appId,
            user_id=userId,
            name=name,
            description=description,
            groups=groups,
            group_conditions=groupConditions,
            columns=columns,
        )

    async def add_segment(self, segment: Segment):
        segment.updated_at = segment.created_at
        await Segment.insert(segment)

    async def get_segment(self, segment_id: str) -> Segment:
        return await Segment.get(PydanticObjectId(segment_id))

    async def get_segments_for_app(self, app_id: str) -> List[Segment]:
        return await Segment.find(Segment.app_id == PydanticObjectId(app_id)).to_list()
