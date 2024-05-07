from typing import List, Union
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
    hsmTemplateId: Union[str, None] = None


class GupshupDeliveryReportEventObject(BaseModel):
    response: list[GupshupDeliveryReportEvent]
