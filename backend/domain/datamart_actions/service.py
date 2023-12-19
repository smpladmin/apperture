from datetime import datetime
import logging
from typing import Dict, List, Union

from beanie import PydanticObjectId
from fastapi import Depends
from domain.apps.models import ClickHouseCredential
from domain.integrations.models import MsSQLCredential, MySQLCredential
from domain.spreadsheets.models import DatabaseClient

from domain.datamart_actions.models import (
    DatamartAction,
    Schedule,
    GoogleSheetMeta,
    APIMeta,
    ActionType,
    TableMeta,
)
from mongo import Mongo
import requests
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os
from repositories.clickhouse.datamart import DataMartRepo


class DatamartActionService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
        datamart_repo: DataMartRepo = Depends(),
    ):
        self.mongo = mongo
        self.datamart_repo = datamart_repo

    def build_datamart_action(
        self,
        datasource_id: PydanticObjectId,
        datamart_id: PydanticObjectId,
        app_id: PydanticObjectId,
        user_id: str,
        type: ActionType,
        meta: Union[GoogleSheetMeta, APIMeta, TableMeta],
        schedule: Schedule,
    ) -> DatamartAction:
        return DatamartAction(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            datamart_id=datamart_id,
            type=type,
            schedule=schedule,
            meta=meta,
        )

    async def save_datamart_action(self, datamart_action: DatamartAction):
        return await DatamartAction.insert(datamart_action)

    async def update_datamart_action(
        self,
        id: str,
        action: DatamartAction,
    ):
        to_update = action.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()

        await DatamartAction.find_one(
            DatamartAction.id == PydanticObjectId(id),
        ).update({"$set": to_update})

    async def refresh_table_action(
        self,
        app_id: str,
        clickhouse_credential: ClickHouseCredential,
        database_client: DatabaseClient,
        database_credential: Union[
            ClickHouseCredential, MySQLCredential, MsSQLCredential
        ],
        query: str,
        table_name: str,
    ) -> bool:
        await self.datamart_repo.drop_table(
            table_name=table_name,
            clickhouse_credential=clickhouse_credential,
            app_id=app_id,
        )
        if database_client == DatabaseClient.MSSQL:
            update_status = await self.datamart_repo.create_mssql_table(
                query=query,
                table_name=table_name,
                clickhouse_credential=clickhouse_credential,
                db_creds=database_credential,
                app_id=app_id,
            )
        else:
            update_status = await self.datamart_repo.create_table(
                query=query,
                table_name=table_name,
                clickhouse_credential=clickhouse_credential,
                app_id=app_id,
            )
        return update_status

    async def get_datamart_action(self, id: str) -> DatamartAction:
        return await DatamartAction.get(PydanticObjectId(id))

    async def get_datamart_actions_for_datamart(
        self, datamart_id: str
    ) -> List[DatamartAction]:
        return await DatamartAction.find(
            DatamartAction.datamart_id == PydanticObjectId(datamart_id),
            DatamartAction.enabled != False,
        ).to_list()

    async def get_datamart_actions(self) -> List[DatamartAction]:
        return await DatamartAction.find(
            DatamartAction.enabled != False,
        ).to_list()

    async def delete_datamart_actions(self, id: str):
        await DatamartAction.find_one(
            DatamartAction.id == PydanticObjectId(id),
        ).update({"$set": {"enabled": False}})
        return

    async def delete_datamart_actions_for_datamart(self, datamart_id: str):
        await DatamartAction.find(
            DatamartAction.datamart_id == PydanticObjectId(datamart_id),
        ).update_many({"$set": {"enabled": False}})
        return

    def get_google_credentials(self, access_token: str, refresh_token: str):
        creds_dict = {
            "token": access_token,
            "refresh_token": refresh_token,
            "token_uri": os.environ["TOKEN_URI"],
            "client_id": os.environ["GOOGLE_SHEET_CLIENT_ID"],
            "client_secret": os.environ["GOOGLE_SHEET_CLIENT_SECRET"],
        }

        return Credentials.from_authorized_user_info(creds_dict)

    def initialize_google_sheet_service(self, access_token: str, refresh_token: str):
        creds = self.get_google_credentials(
            access_token=access_token, refresh_token=refresh_token
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

    def initialize_google_drive_service(self, access_token: str, refresh_token: str):
        creds = self.get_google_credentials(
            access_token=access_token, refresh_token=refresh_token
        )
        try:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            return build("drive", "v3", credentials=creds)
        except:
            raise Exception("Could not validate credentials")

    def retrieve_all_files(self, drive_service, page_token=None):
        all_files = []

        while True:
            result = (
                drive_service.files()
                .list(
                    q="mimeType='application/vnd.google-apps.spreadsheet'",
                    fields="nextPageToken, files(id, name)",
                    pageToken=page_token,
                )
                .execute()
            )

            files = result.get("files", [])
            all_files.extend(files)

            page_token = result.get("nextPageToken")
            if not page_token:
                break

        return all_files

    def get_google_spreadsheets(self, refresh_token: str):
        try:
            drive_service = self.initialize_google_drive_service(
                access_token="", refresh_token=refresh_token
            )
            spreadsheets = self.retrieve_all_files(drive_service=drive_service)
            return spreadsheets
        except Exception as e:
            logging.info(e)

    def get_sheet_names(self, refresh_token: str, spreadsheet_id: str):
        sheet_service = self.initialize_google_sheet_service(
            access_token="", refresh_token=refresh_token
        )
        sheet_metadata = (
            sheet_service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        )
        sheets = sheet_metadata.get("sheets", [])
        sheet_names = []
        for sheet in sheets:
            sheet_names.append(sheet["properties"]["title"])

        return sheet_names
