from datetime import datetime
import logging
from typing import Dict, List, Union

from beanie import PydanticObjectId
from fastapi import Depends

from domain.apps.models import ClickHouseCredential
from domain.common.random_string_utils import StringUtils
from domain.datamart.models import DataMart, GoogleSheet
from domain.integrations.models import MsSQLCredential
from domain.spreadsheets.models import DatabaseClient
from mongo import Mongo
from repositories.clickhouse.clickhouse_role import ClickHouseRole
from repositories.clickhouse.datamart import DataMartRepo

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os


class DataMartService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
        datamart_repo: DataMartRepo = Depends(),
        clickhouse_role: ClickHouseRole = Depends(),
        string_utils: StringUtils = Depends(),
    ):
        self.mongo = mongo
        self.datamart_repo = datamart_repo
        self.clickhouse_role = clickhouse_role
        self.string_utils = string_utils

    def build_datamart_table(
        self,
        datasource_id: PydanticObjectId,
        app_id: PydanticObjectId,
        user_id: str,
        name: str,
        query: str,
    ) -> DataMart:
        now = datetime.now()
        return DataMart(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            name=name,
            table_name=self.string_utils.extract_tablename_from_filename(filename=name),
            query=query,
            last_refreshed=now,
        )

    async def create_datamart_table(
        self,
        table: DataMart,
        clickhouse_credential: ClickHouseCredential,
        database_client: DatabaseClient,
        db_creds: Union[MsSQLCredential, None],
    ):
        table.updated_at = table.created_at
        if database_client == DatabaseClient.MSSQL:
            creation_status = await self.datamart_repo.create_mssql_table(
                query=table.query,
                table_name=table.table_name,
                clickhouse_credential=clickhouse_credential,
                db_creds=db_creds,
                app_id=str(table.app_id),
            )
        else:
            creation_status = await self.datamart_repo.create_table(
                query=table.query,
                table_name=table.table_name,
                clickhouse_credential=clickhouse_credential,
                app_id=str(table.app_id),
            )
        if creation_status:
            await DataMart.insert(table)
        return creation_status

    async def update_table_action(
        self,
        datamart_id: str,
        clickhouse_credential: ClickHouseCredential,
        to_update: Dict,
        database_client: DatabaseClient,
        db_creds: Union[MsSQLCredential, None],
        query: Union[str, None] = None,
        table_name: Union[str, None] = None,
    ):
        existing_table = (
            await DataMart.find(
                DataMart.id == PydanticObjectId(datamart_id),
            ).to_list()
        )[0]

        query = query if query else existing_table.query
        table_name = table_name if table_name else existing_table.table_name

        await self.datamart_repo.drop_table(
            table_name=existing_table.table_name,
            clickhouse_credential=clickhouse_credential,
            app_id=str(existing_table.app_id),
        )
        if database_client == DatabaseClient.MSSQL:
            update_status = await self.datamart_repo.create_mssql_table(
                query=query,
                table_name=table_name,
                clickhouse_credential=clickhouse_credential,
                db_creds=db_creds,
                app_id=str(existing_table.app_id),
            )
        else:
            update_status = await self.datamart_repo.create_table(
                query=query,
                table_name=table_name,
                clickhouse_credential=clickhouse_credential,
                app_id=str(existing_table.app_id),
            )
        if update_status:
            await DataMart.find_one(
                DataMart.id == PydanticObjectId(datamart_id),
            ).update({"$set": to_update})
        return update_status

    async def update_datamart_table(
        self,
        table_id: str,
        new_table: DataMart,
        database_client: DatabaseClient,
        db_creds: Union[MsSQLCredential, None],
        clickhouse_credential: ClickHouseCredential,
    ):
        to_update = new_table.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()

        update_status = await self.update_table_action(
            datamart_id=table_id,
            clickhouse_credential=clickhouse_credential,
            to_update=to_update,
            query=new_table.query,
            table_name=new_table.table_name,
            db_creds=db_creds,
            database_client=database_client,
        )
        return update_status

    async def get_datamart_table(self, id: str) -> DataMart:
        return await DataMart.get(PydanticObjectId(id))

    async def get_datamart_tables_for_app_id(
        self, app_id: PydanticObjectId
    ) -> List[DataMart]:
        return await DataMart.find(
            DataMart.app_id == app_id,
            DataMart.enabled != False,
        ).to_list()

    async def get_datamarts(self) -> List[DataMart]:
        return await DataMart.find(
            DataMart.enabled != False,
        ).to_list()

    async def get_all_apps_with_datamarts(self) -> List[str]:
        tables = await self.get_datamarts()
        return list(set([str(table.app_id) for table in tables]))

    async def update_datamart_refresh_token_for_user(self, user_id: str, token: str):
        await DataMart.find(
            DataMart.user_id == PydanticObjectId(user_id),
            DataMart.enabled != False,
        ).update_many({"$set": {"refresh_token": token}})
        return

    async def delete_datamart_table(
        self,
        datamart_id: str,
        table_name: str,
        app_id: str,
        clickhouse_credential: ClickHouseCredential,
    ):
        await self.datamart_repo.drop_table(
            table_name=table_name,
            clickhouse_credential=clickhouse_credential,
            app_id=app_id,
        )

        await DataMart.find_one(
            DataMart.id == PydanticObjectId(datamart_id),
        ).update({"$set": {"enabled": False}})
        return

    async def refresh_datamart_table(
        self,
        datamart_id: str,
        clickhouse_credential: ClickHouseCredential,
        database_client: DatabaseClient = DatabaseClient.CLICKHOUSE,
        db_creds: Union[MsSQLCredential, MsSQLCredential, None] = None,
    ):
        to_update = {"last_refreshed": datetime.utcnow()}
        refresh_status = await self.update_table_action(
            datamart_id=datamart_id,
            clickhouse_credential=clickhouse_credential,
            to_update=to_update,
            database_client=database_client,
            db_creds=db_creds,
        )
        return refresh_status

    def initialize_google_drive_service(self, access_token: str, refresh_token: str):
        creds = Credentials(
            access_token,
            refresh_token=refresh_token,
            token_uri=os.environ["TOKEN_URI"],
            client_id=os.environ["GOOGLE_SHEET_CLIENT_ID"],
            client_secret=os.environ["GOOGLE_SHEET_CLIENT_SECRET"],
        )

        try:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            return build("drive", "v3", credentials=creds)
        except:
            raise Exception("Could not validate credentials")

    def retrieve_all_files(drive_service, page_token=None):
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

    def get_google_sheets(self, refresh_token: str):
        service = self.initialize_google_drive_service(
            access_token="", refresh_token=refresh_token
        )

        self.retrieve_all_files(drive_service=service)

    def initialize_google_sheet_service(self, access_token: str, refresh_token: str):
        creds = Credentials(
            access_token,
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
        self, refresh_token: str, app_id: str, query: str, google_sheet: GoogleSheet
    ):
        service = self.initialize_google_sheet_service(
            access_token="", refresh_token=refresh_token
        )

        try:
            result = await self.datamart_repo.execute_query_for_app_restricted_clients(
                app_id=app_id, query=query
            )
            columns = list(result.column_names)
            data = [list(entry) for entry in result.result_set]
            sheet_data = [columns] + data

            sheet = service.spreadsheets()
            sheet.values().update(
                spreadsheetId=google_sheet.spreadsheet.id,
                range=google_sheet.sheet_range,
                valueInputOption="USER_ENTERED",
                body={"values": sheet_data},
            ).execute()
        except Exception as e:
            logging.info(e)
