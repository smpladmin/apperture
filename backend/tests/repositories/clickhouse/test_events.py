from repositories.clickhouse.events import Events


class TestEventsRepository:
    def setup_method(self):
        self.repo = Events()

    def test_build_unique_events_query(self):
        ds_id = "mock-ds-id"

        query, params = self.repo.build_unique_events_query(ds_id)

        assert params == {"ds_id": ds_id}
        assert query == (
            'SELECT DISTINCT "event_name" FROM "events" WHERE "datasource_id"=%(ds_id)s '
            "AND \"event_name\" NOT LIKE '%%/%%' AND \"event_name\" NOT LIKE '%%?%%'"
        )
