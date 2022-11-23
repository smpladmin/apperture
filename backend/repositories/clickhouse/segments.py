from typing import List
from fastapi import Depends
from clickhouse.clickhouse import Clickhouse
from domain.segments.models import SegmentFilter


class Segments:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = "events"

    def get_segment(self, datasource_id: str, filters: List[SegmentFilter]):
        pass

    def build_segment_query(self, datasource_id: str, filter: List[SegmentFilter]):
        pass
