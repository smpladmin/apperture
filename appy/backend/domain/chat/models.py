from beanie import PydanticObjectId

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
