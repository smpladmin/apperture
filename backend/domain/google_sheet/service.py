from datetime import datetime
from typing import List
from beanie import PydanticObjectId

from domain.google_sheet.models import SheetQuery


class GoogleSheetService:
    def __init__(self):
        pass

    def build_sheet_query(
        self,
        name: str,
        app_id: PydanticObjectId,
        user_id: PydanticObjectId,
        spreadsheet_id: str,
        query: str,
        chats: List,
        sheet_reference: dict,
    ) -> SheetQuery:
        return SheetQuery(
            name=name,
            app_id=app_id,
            user_id=user_id,
            query=query,
            chats=chats,
            spreadsheet_id=spreadsheet_id,
            sheet_reference=sheet_reference,
        )

    async def add_sheet_query(self, sheet_query: SheetQuery):
        sheet_query.updated_at = sheet_query.created_at
        await SheetQuery.insert(sheet_query)

    async def update_sheet_query(self, sheet_query_id: str, sheet_query: SheetQuery):
        to_update = sheet_query.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()

        await SheetQuery.find_one(
            SheetQuery.id == PydanticObjectId(sheet_query_id),
        ).update({"$set": to_update})

    async def get_sheet_queries_by_spreadsheet_id(self, spreadsheet_id: str):
        return await SheetQuery.find(
            SheetQuery.spreadsheet_id == spreadsheet_id, SheetQuery.enabled == True
        ).to_list()
