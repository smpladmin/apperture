from typing import List

from pydantic import BaseModel

from domain.segments.models import SegmentFilter


class TransientSegmentDto(BaseModel):
    datasourceId: str
    filters: List[SegmentFilter]
