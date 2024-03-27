from typing import List
from pydantic import BaseModel


class FlutterBatchData(BaseModel):
    api_key: str
    batch: List

class GupshupDeliveryReportEvent(BaseModel):
    externalId: str
    eventType: str
    eventTs: int
    destAddr: int # "destAddr”: 919892488888 (!int or long)
    # srcAddr: str, in the example but not in the docs
    cause: str
    errCode: str
    # “channel”: “SMS" , in the example but not in the docs
    noOfFrags: int
