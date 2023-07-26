from unittest.mock import MagicMock, call

from repositories.clickhouse.integrations import Integrations


class TestIntegrationsRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Integrations(self.clickhouse)
        repo.execute_query_for_restricted_client = MagicMock(return_value=True)
        self.repo = repo
        self.datasource_id = "test-id"

    def test_create_table_from_csv(self):
        self.repo.create_table_from_csv(
            name="test",
            username="username",
            password="password",
            db_name="db",
            s3_key="s3-key",
        )
        calls = [
            call(
                password="password",
                query="DROP TABLE IF EXISTS db.test",
                username="username",
            ),
            call(
                password="password",
                query="CREATE TABLE db.test ENGINE = MergeTree() ORDER BY tuple() AS "
                "SELECT * FROM "
                "s3('https://apperture-clickhouse-backup.s3.ap-south-1.amazonaws.com/s3-key', "
                "'AKIATCYOZQRYPWO7LPWG', 'q7fTHzQ9o41FPYAMPo4524xRVIOZaOaI/ioxCv50', "
                "CSVWithNames)",
                username="username",
            ),
        ]
        self.repo.execute_query_for_restricted_client.assert_has_calls(
            calls=calls,
        )
