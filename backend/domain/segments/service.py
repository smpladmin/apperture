from typing import List
from fastapi import Depends
from domain.segments.models import SegmentFilter
from repositories.clickhouse.segments import Segments


class SegmentService:
    def __init__(self, segments: Segments = Depends()):
        self.segments = segments

    async def compute_segment(self, datasource_id: str, events: List[SegmentFilter]):
        return self.segments.get_segment(datasource_id, events)
