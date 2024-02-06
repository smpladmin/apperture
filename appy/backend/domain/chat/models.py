from beanie import PydanticObjectId
from typing import NamedTuple, List
from enum import Enum
from repositories.document import Document


class ChatSettings(Document):
    user_id: PydanticObjectId
    system_message: str
    history_length: int

    class Settings:
        name = "chat_settings"


class Chat(Document):
    query_id: PydanticObjectId
    user_id: PydanticObjectId
    question: str
    answer: str

    class Settings:
        name = "chats"


class ReturnType(str, Enum):
    STRING = "str"
    FLOAT = "float"
    INT = "int"
    DATAFRAME = "dataframe"


class ChatQueries(NamedTuple):
    query: str
    return_type: ReturnType = ReturnType.STRING
    query_params: List[str] = []
