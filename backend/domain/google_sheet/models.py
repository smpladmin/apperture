from typing import List

from beanie import PydanticObjectId
from repositories.document import Document


class SheetQuery(Document):
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    query: str
    spreadsheet_id: str
    chats: List[dict]
    sheet_reference: dict
    enabled: bool = True

    class Settings:
        name = "sheet_query"
