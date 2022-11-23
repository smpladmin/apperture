from typing import List

from domain.segments.models import SegmentFilter


class TransientSegmentDto:
    datasourceId: str
    filters: List[SegmentFilter]
