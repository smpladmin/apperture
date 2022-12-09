from typing import List
from fastapi import Depends
from domain.segments.models import (
    SegmentGroup,
    SegmentFilterConditions,
    ComputedSegment,
)
from repositories.clickhouse.segments import Segments


class SegmentService:
    def __init__(self, segments: Segments = Depends()):
        self.segments = segments

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
