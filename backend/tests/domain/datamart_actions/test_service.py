from collections import namedtuple
from datetime import datetime
from unittest.mock import ANY, AsyncMock, MagicMock

import pytest
from beanie import PydanticObjectId

from domain.apps.models import ClickHouseCredential
from domain.datamart_actions.models import (
    ActionType,
    DatamartAction,
    GoogleSheetMeta,
    Schedule,
    Spreadsheet,
)

from domain.datamart_actions.service import DatamartActionService
from domain.datasources.models import DataSource
from domain.spreadsheets.models import DatabaseClient


class TestDataMartService:
    def setup_method(self):
        DatamartAction.get_settings = MagicMock()
        DatamartAction.find_one = AsyncMock()
        DatamartAction.update = AsyncMock()
        DataSource.get_settings = MagicMock()
        self.mongo = MagicMock()
        self.datamart_repo = MagicMock()
        self.service = DatamartActionService(
            mongo=self.mongo,
            datamart_repo=self.datamart_repo,
        )
        self.ds_id = "636a1c61d715ca6baae65611"
        self.app_id = "636a1c61d715ca6baae65612"
        self.user_id = "636a1c61d715ca6baae65611"
        self.name = "name"

        FindMock = namedtuple("FindMock", ["to_list"])
        DatamartAction.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )
        DatamartAction.app_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        DatamartAction.user_id = MagicMock(return_value=PydanticObjectId(self.user_id))
        DatamartAction.datasource_id = MagicMock(
            return_value=PydanticObjectId(self.ds_id)
        )
        self.datamart_action = DatamartAction(
            datasource_id=self.ds_id,
            datamart_id=self.ds_id,
            app_id=self.app_id,
            user_id=self.user_id,
            type=ActionType.GOOGLE_SHEET,
            meta=GoogleSheetMeta(
                spreadsheet=Spreadsheet(id="1qu87sylkjuesopp98", name="Test"),
                sheet="Sheet1",
            ),
            schedule=Schedule(
                frequency="hourly", time=None, period=None, date=None, day=None
            ),
            enabled=True,
        )

        FindOneMock = namedtuple("FindOneMock", ["update"])
        self.update_mock = AsyncMock()
        DatamartAction.find_one = MagicMock(
            return_value=FindOneMock(update=self.update_mock)
        )
        DatamartAction.get = AsyncMock()
        DatamartAction.insert = AsyncMock()
        DatamartAction.id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        DatamartAction.enabled = True
        self.service.datamart_repo.create_table = AsyncMock()
        self.service.datamart_repo.drop_table = AsyncMock()
        self.clickhouse_credential = ClickHouseCredential(
            username="test-username",
            password="test-password",
            databasename="test-database",
        )

    def test_retrieve_all_files(self):
        drive_service_mock = MagicMock()
        files_data = [
            {"id": "file_id_1", "name": "File 1"},
            {"id": "file_id_2", "name": "File 2"},
        ]
        next_page_token = None

        drive_service_mock.files.return_value.list.return_value.execute.return_value = {
            "files": files_data,
            "nextPageToken": next_page_token,
        }

        all_files = self.service.retrieve_all_files(drive_service_mock)

        drive_service_mock.files.assert_called_once()
        drive_service_mock.files.return_value.list.assert_called_once_with(
            q="mimeType='application/vnd.google-apps.spreadsheet'",
            fields="nextPageToken, files(id, name)",
            pageToken=None,
        )

        assert all_files == files_data

    def test_get_google_sheets(self):
        drive_service_mock = MagicMock()
        self.service.initialize_google_drive_service = MagicMock(
            return_value=drive_service_mock
        )
        self.service.retrieve_all_files = MagicMock()

        self.service.get_google_spreadsheets(refresh_token="345k-f192")

        self.service.initialize_google_drive_service.assert_called_with(
            access_token="", refresh_token="345k-f192"
        )
        self.service.retrieve_all_files.assert_called_with(
            drive_service=drive_service_mock
        )
