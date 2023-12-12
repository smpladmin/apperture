from typing import List
from pydantic import BaseModel


class FlutterBatchData(BaseModel):
    api_key: str
    batch: List
