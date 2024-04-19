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
    errorCode: str
    channel: str
    noOfFrags: int = 0


class GupshupDeliveryReportEventObject(BaseModel):
    response: list[GupshupDeliveryReportEvent]
