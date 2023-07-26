from unittest.mock import MagicMock, AsyncMock

import pytest
from beanie import PydanticObjectId

from domain.files.models import File
from domain.files.service import FilesService


class TestFilesService:
    def setup_method(self):
        self.clickhouse = MagicMock()
        self.clickhouse.client = MagicMock()
        self.clickhouse.client.insert = MagicMock()
        self.service = FilesService()
        File.get_settings = MagicMock()
        File.insert = AsyncMock()
        File.get = AsyncMock()

    def test_build_s3_key(self):
        assert (
            self.service.build_s3_key(app_id="test-id", filename="test.csv")
            == "csvs/test-id/test.csv"
        )

    def test_extract_tablename_from_filename(self):
        assert (
            self.service.extract_tablename_from_filename(filename="csv file@!12.csv")
            == "csv_file12"
        )

    @pytest.mark.asyncio
    async def test_add_file(self):
        await self.service.add_file(
            filename="test.csv",
            s3_key="csvs/64bff7f78fcdf20fd46ac7d1/test.csv",
            app_id="64bff7f78fcdf20fd46ac7d1",
        )
        File.insert.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_file(self):
        await self.service.get_file(id="64bff7f78fcdf20fd46ac7d1")
        File.get.assert_called_once_with(
            PydanticObjectId("64bff7f78fcdf20fd46ac7d1"),
        )
