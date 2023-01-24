from unittest.mock import MagicMock

from repositories.clickhouse.events import Events


class TestEventsRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Events(clickhouse=self.clickhouse)
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.datasource_id = "test-id"
        self.date = "2022-01-01"
        self.all_props = ["prop1", "prop2", "prop3"]
        self.event_properties_params = {"ds_id": "test-id"}
        self.distinct_counts_params = {"date": "2022-01-01", "ds_id": "test-id"}
        self.event_properties_query = (
            'SELECT JSONExtractKeys(toJSONString("properties")),DATE("timestamp") FROM '
            '"events" WHERE "datasource_id"=%(ds_id)s LIMIT 1'
        )
        self.distinct_counts_query = (
            'SELECT COUNT(DISTINCT "properties.prop1"),COUNT(DISTINCT '
            '"properties.prop2"),COUNT(DISTINCT "properties.prop3") FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")=%(date)s'
        )
        self.values_for_property_param = {
            "ds_id": "test-id",
            "end_date": "2022-01-01",
            "start_date": "1970-01-01",
        }
        self.values_for_property_query = (
            'SELECT DISTINCT "properties.country" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
            'DATE("timestamp")<=%(end_date)s LIMIT 100'
        )

    def test_build_unique_events_query(self):
        query, params = self.repo.build_unique_events_query(self.datasource_id)
        assert params == {"ds_id": self.datasource_id}
        assert query == (
            'SELECT DISTINCT "event_name" FROM "events" WHERE "datasource_id"=%(ds_id)s '
            "AND \"event_name\" NOT LIKE '%%/%%' AND \"event_name\" NOT LIKE '%%?%%'"
        )

    def test_get_event_properties(self):
        self.repo.get_event_properties(
            datasource_id=self.datasource_id,
        )
        self.repo.execute_get_query.assert_called_once_with(
            self.event_properties_query, self.event_properties_params
        )

    def test_build_event_properties_query(self):
        assert self.repo.build_event_properties_query(
            datasource_id=self.datasource_id
        ) == (self.event_properties_query, self.event_properties_params)

    def test_get_distinct_values_for_properties(self):
        self.repo.get_distinct_values_for_properties(
            ds_id=self.datasource_id,
            date=self.date,
            all_props=self.all_props,
        )
        self.repo.execute_get_query.assert_called_once_with(
            self.distinct_counts_query, self.distinct_counts_params
        )

    def test_build_distinct_values_for_properties_query(self):
        assert self.repo.build_distinct_values_for_properties_query(
            ds_id=self.datasource_id,
            date=self.date,
            all_props=self.all_props,
        ) == (self.distinct_counts_query, self.distinct_counts_params)

    def test_get_values_for_property(self):
        self.repo.get_values_for_property(
            datasource_id=self.datasource_id,
            event_property="country",
            start_date="1970-01-01",
            end_date=self.date,
        )
        self.repo.execute_get_query.assert_called_once_with(
            self.values_for_property_query, self.values_for_property_param
        )

    def test_build_get_values_for_property_query(self):
        assert self.repo.build_values_for_property_query(
            datasource_id=self.datasource_id,
            event_property="country",
            start_date="1970-01-01",
            end_date=self.date,
        ) == (self.values_for_property_query, self.values_for_property_param)

    def test_get_all_datasources(self):
        self.repo.get_all_datasources()
        self.repo.execute_get_query.assert_called_once_with(
            'SELECT DISTINCT "datasource_id" FROM "events"', {}
        )

    def test_build_get_all_datasources_query(self):
        assert self.repo.build_get_all_datasources_query() == (
            'SELECT DISTINCT "datasource_id" FROM "events"',
            {},
        )

    def test_get_events(self):
        self.repo.get_events(datasource_id=self.datasource_id)
        self.repo.execute_get_query.assert_called_once_with(
            'SELECT "event_name","timestamp","user_id","provider" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s',
            {"ds_id": "test-id"},
        )

    def test_build_events_query(self):
        assert self.repo.build_events_query(datasource_id=self.datasource_id) == (
            'SELECT "event_name","timestamp","user_id","provider" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s',
            {"ds_id": "test-id"},
        )
