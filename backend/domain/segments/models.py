from typing import Optional
from pydantic import BaseModel


class SegmentFilter(BaseModel):
    event: str
    operator: Optional[str]
    operand: Optional[int]
    function: str = "count"
