from datetime import datetime
import logging
from typing import List, Union

from beanie import PydanticObjectId
from fastapi import Depends

from domain.datamart_actions.models import (
    DatamartActions,
    HourlySchedule,
    DailySchedule,
    GoogleSheetMeta,
    MonthlySchedule,
    TableMeta,
    APIMeta,
    ActionType,
    WeeklySchedule,
)
from mongo import Mongo
import requests
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os


class DatamartActionService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
    ):
        self.mongo = mongo

    def build_datamart_action(
        self,
        datasource_id: PydanticObjectId,
        datamart_id: PydanticObjectId,
        app_id: PydanticObjectId,
        user_id: str,
        type: ActionType,
        meta: Union[GoogleSheetMeta, APIMeta, TableMeta],
        schedule: Union[WeeklySchedule, MonthlySchedule, DailySchedule, HourlySchedule],
    ) -> DatamartActions:
        return DatamartActions(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            datamart_id=datamart_id,
            type=type,
            schedule=schedule,
            meta=meta,
        )

    async def save_datamart_action(self, datamart_action: DatamartActions):
        return await DatamartActions.insert(datamart_action)

    async def update_datamart_action(
        self,
        id: str,
        action: DatamartActions,
    ):
        to_update = action.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()

        await DatamartActions.find_one(
            DatamartActions.id == PydanticObjectId(id),
        ).update({"$set": to_update})

    async def get_datamart_action(self, id: str) -> DatamartActions:
        return await DatamartActions.get(PydanticObjectId(id))

    async def get_datamart_actions_for_datamart(
        self, datamart_id: str
    ) -> List[DatamartActions]:
        return await DatamartActions.find(
            DatamartActions.datamart_id == PydanticObjectId(datamart_id),
            DatamartActions.enabled != False,
        ).to_list()

    async def get_datamart_actions(self) -> List[DatamartActions]:
        return await DatamartActions.find(
            DatamartActions.enabled != False,
        ).to_list()

    def initialize_google_sheet_service(self, access_token: str, refresh_token: str):
        creds = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri=os.environ["TOKEN_URI"],
            client_id=os.environ["GOOGLE_SHEET_CLIENT_ID"],
            client_secret=os.environ["GOOGLE_SHEET_CLIENT_SECRET"],
        )
        try:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            return build("sheets", "v4", credentials=creds)
        except:
            raise Exception("Could not validate credentials")

    async def push_to_google_sheet(
        self,
        refresh_token: str,
        google_sheet: GoogleSheetMeta,
        columns: List[str],
        data: List,
    ):
        try:
            service = self.initialize_google_sheet_service(
                access_token="", refresh_token=refresh_token
            )
            sheet_data = [columns] + data

            sheet_range = google_sheet.sheet + "!A1"
            sheet = service.spreadsheets()
            sheet.values().update(
                spreadsheetId=google_sheet.spreadsheet.id,
                range=sheet_range,
                valueInputOption="USER_ENTERED",
                body={"values": sheet_data},
            ).execute()
        except Exception as e:
            logging.info(e)
            raise Exception(f"Error: {e}")

    async def push_to_api(
        self, api_credential: APIMeta, columns: List[str], data: List
    ):
        try:
            url = api_credential.url
            headers = json.loads(api_credential.headers)
            payload: {columns, data}

            requests.post(url=url, headers=headers, json=payload)

        except Exception as e:
            logging.info(e)
            raise Exception(f"Error: {e}")
