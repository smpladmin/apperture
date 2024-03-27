from typing import List
from pydantic import BaseModel


class FlutterBatchData(BaseModel):
    api_key: str
    batch: List


class GupshupDeliveryReportEvent(BaseModel):
    externalId: str
    eventType: str
    eventTs: int
    destAddr: str
    srcAddr: str
    cause: str
    errCode: str
    channel: str
    noOfFrags: int
