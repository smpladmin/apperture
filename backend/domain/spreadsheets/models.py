from typing import List
from pydantic import BaseModel


class ComputedSpreadsheet(BaseModel):
    data: List[dict]
    headers: List[str]
