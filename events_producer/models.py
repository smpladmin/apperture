from typing import List, Union, Any
from enum import Enum
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


class AIModels(str, Enum):
    GPT_35_TURBO = "gpt-3.5-turbo"
    GPT_4_OMNI = "gpt-4o-2024-05-13"
    CLAUDE_3_SONNET = "claude-3-sonnet-20240229"


class Message(BaseModel):
    role: str
    content: str


class AgentCall(BaseModel):
    messages: List[Message]
    llm_output: str
    final_output: Any
    cost: float
    input_tokens: int
    output_tokens: int
    model: AIModels


class AgentLogEvent(BaseModel):
    query_id: str
    user_query: str
    timestamp: str
    cost: float
    agent_calls: List[AgentCall]

    @staticmethod
    def build(
        query_id: str,
        user_query: str,
        timestamp: str,
        cost: float,
        agent_calls: List[AgentCall],
    ):
        return AgentLogEvent(
            query_id=query_id,
            user_query=user_query,
            timestamp=timestamp,
            cost=cost,
            agent_calls=agent_calls,
        )
