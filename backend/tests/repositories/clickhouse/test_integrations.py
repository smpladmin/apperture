from unittest.mock import MagicMock, call

import pytest

from repositories.clickhouse.integrations import Integrations


class TestIntegrationsRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Integrations(self.clickhouse)
        self.clickhouse.client.query = MagicMock(return_value=True)
        self.repo = repo
        self.datasource_id = "test-id"
        self.repo.s3_path = (
            "https://apperture-clickhouse-backup.s3.ap-south-1.amazonaws.com/"
        )
        self.repo.aws_access_key = "AKIATCYOZQRYPWO7LPWG"
        self.repo.aws_secret_access_key = "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"

    @pytest.mark.sasyncio
    async def test_create_table_from_csv(self):
        await self.repo.create_table_from_csv(
            name="test", db_name="db", s3_key="s3-key", app_id="test-app-id"
        )
        calls = [
            call(query="DROP TABLE IF EXISTS db.test", app_id="test-app-id"),
            call(
                query="CREATE TABLE db.test ENGINE = MergeTree() ORDER BY tuple() AS "
                "SELECT * FROM "
                "s3('https://apperture-clickhouse-backup.s3.ap-south-1.amazonaws.com/s3-key', "
                "'AKIATCYOZQRYPWO7LPWG', 'q7fTHzQ9o41FPYAMPo4524xRVIOZaOaI/ioxCv50', "
                "CSVWithNames)",
                app_id="test-app-id",
            ),
        ]
        self.clickhouse.client.query.assert_has_calls(
            calls=calls,
        )
