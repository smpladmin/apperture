from typing import Optional
from pydantic import BaseModel


class SegmentFilter(BaseModel):
    event: str
    condition: Optional[str]
    function: str = "count"
