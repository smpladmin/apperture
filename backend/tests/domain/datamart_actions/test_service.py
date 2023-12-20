from collections import namedtuple
import json
from unittest.mock import ANY, AsyncMock, MagicMock, Mock, patch

import pytest
from beanie import PydanticObjectId

from domain.apps.models import ClickHouseCredential
from domain.datamart_actions.models import (
    APIMeta,
    ActionType,
    DatamartAction,
    GoogleSheetMeta,
    Schedule,
    Spreadsheet,
)

from domain.datamart_actions.service import DatamartActionService
from domain.datasources.models import DataSource


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
        self.user_id = "636a1c61d715ca6baae65613"
        self.datamart_id = "636a1c61d715ca6baae65614"
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
        DatamartAction.datamart_id = MagicMock(
            return_value=PydanticObjectId(self.datamart_id)
        )
        self.datamart_action = DatamartAction(
            datasource_id=self.ds_id,
            datamart_id=self.datamart_id,
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

    def test_build_datamart_action(self):
        result = self.service.build_datamart_action(
            datasource_id=self.ds_id,
            datamart_id=self.datamart_id,
            app_id=self.app_id,
            user_id=self.user_id,
            type="google_sheet",
            meta={
                "spreadsheet": {"id": "1qu87sylkjuesopp98", "name": "Test"},
                "sheet": "Sheet1",
            },
            schedule={"frequency": "hourly"},
        )
        assert result.dict() == {
            "id": None,
            "revision_id": None,
            "created_at": ANY,
            "updated_at": None,
            "datasource_id": PydanticObjectId("636a1c61d715ca6baae65611"),
            "app_id": PydanticObjectId("636a1c61d715ca6baae65612"),
            "user_id": PydanticObjectId("636a1c61d715ca6baae65613"),
            "datamart_id": PydanticObjectId("636a1c61d715ca6baae65614"),
            "type": "google_sheet",
            "schedule": {
                "time": None,
                "period": None,
                "date": None,
                "day": None,
                "frequency": "hourly",
            },
            "meta": {
                "spreadsheet": {"id": "1qu87sylkjuesopp98", "name": "Test"},
                "sheet": "Sheet1",
            },
            "enabled": True,
        }

    @pytest.mark.asyncio
    async def test_save_datamart_action(self):
        action = await self.service.save_datamart_action(
            datamart_action=self.datamart_action
        )
        DatamartAction.insert.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_datamart_actions(self):
        await self.service.update_datamart_action(
            id=self.ds_id,
            action=self.datamart_action,
        )
        DatamartAction.find_one.assert_called_once_with(
            False,
        )

    @pytest.mark.asyncio
    async def test_update_datamart_actions(self):
        await self.service.update_datamart_action(
            id=self.ds_id,
            action=self.datamart_action,
        )
        DatamartAction.find_one.assert_called_once_with(
            False,
        )

    @pytest.mark.asyncio
    async def test_get_datamart_Action(self):
        await self.service.get_datamart_action(id="6384a65e0a397236d9de236a")
        DatamartAction.get.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_datamart_actions_for_datamart(self):
        await self.service.get_datamart_actions_for_datamart(
            datamart_id=self.datamart_id,
        )
        DatamartAction.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_datamart_action(self):
        await self.service.delete_datamart_action(id="6384a65e0a397236d9de236a")
        DatamartAction.find_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_push_to_google_sheet(self):
        refresh_token = "345k-f192"
        google_sheet = GoogleSheetMeta(
            sheet="Sheet1",
            spreadsheet=Spreadsheet(id="1qu87sylkjuesopp98", name="Test"),
        )
        columns = ["Column1", "Column2", "Column3"]
        data = [
            ["Data1", "Data2", "Data3"],
            ["Data4", "Data5", "Data6"],
        ]
        mock_service = MagicMock()
        mock_service.spreadsheets.return_value.values.return_value.update.return_value.execute.return_value = (
            {}
        )
        self.service.initialize_google_sheet_service = MagicMock(
            return_value=mock_service
        )
        await self.service.push_to_google_sheet(
            refresh_token=refresh_token,
            google_sheet=google_sheet,
            columns=columns,
            data=data,
        )

        self.service.initialize_google_sheet_service.assert_called_once_with(
            access_token="", refresh_token=refresh_token
        )
        mock_service.spreadsheets.return_value.values.return_value.update.assert_called_once_with(
            spreadsheetId=google_sheet.spreadsheet.id,
            range="Sheet1!A1",
            valueInputOption="USER_ENTERED",
            body={
                "values": [
                    columns,
                    ["Data1", "Data2", "Data3"],
                    ["Data4", "Data5", "Data6"],
                ]
            },
        )

    @pytest.mark.asyncio
    async def test_push_to_api_with_mock(self):
        api_credential = APIMeta(
            url="https://api.example.com",
            headers='{"Content-Type": "application/json"}',
        )
        columns = ["Column1", "Column2", "Column3"]
        data = [
            ["Data1", "Data2", "Data3"],
            ["Data4", "Data5", "Data6"],
        ]

        with patch("requests.post") as mock_post:
            mock_response = Mock()
            mock_response.status_code = 200
            mock_post.return_value = mock_response
            expected_payload = {"columns": columns, "data": data}

            await self.service.push_to_api(
                api_credential=api_credential, columns=columns, data=data
            )

            mock_post.assert_called_once_with(
                url=api_credential.url,
                headers=json.loads(api_credential.headers),
                json=expected_payload,
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

    def test_get_sheet_names(self):
        mock_service = MagicMock()
        mock_service.spreadsheets.return_value.get.return_value.execute.return_value = {
            "sheets": [
                {"properties": {"title": "Sheet1"}},
                {"properties": {"title": "Sheet2"}},
            ]
        }
        self.service.initialize_google_sheet_service = MagicMock(
            return_value=mock_service
        )

        sheet_names = self.service.get_sheet_names(
            refresh_token="345k-f192", spreadsheet_id="1qu87sylkjuesopp98"
        )

        self.service.initialize_google_sheet_service.assert_called_once_with(
            access_token="", refresh_token="345k-f192"
        )
        mock_service.spreadsheets.return_value.get.assert_called_once_with(
            spreadsheetId="1qu87sylkjuesopp98"
        )
        assert sheet_names == ["Sheet1", "Sheet2"]
