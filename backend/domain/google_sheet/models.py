from typing import List

from beanie import PydanticObjectId
from pydantic import BaseModel
from repositories.document import Document


class SheetReference(BaseModel):
    sheet_name: str
    row_index: int
    column_index: int


class SheetQuery(Document):
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    query: str
    spreadsheet_id: str
    chats: List
    sheet_reference: SheetReference
    enabled: bool = True

    class Settings:
        name = "sheet_query"
