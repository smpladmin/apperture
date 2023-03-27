from repositories.clickhouse.users import User


class TestUserRepository:
    def setup_method(self):
        self.query_property_with_events = 'SELECT "properties" FROM "events" WHERE "datasource_id"=%(ds_id)s AND "user_id"=%(user_id)s AND "event_name"=%(event)s ORDER BY "timestamp" DESC LIMIT 1'
        self.query_property_without_events = 'SELECT "properties" FROM "events" WHERE "datasource_id"=%(ds_id)s AND "user_id"=%(user_id)s ORDER BY "timestamp" DESC LIMIT 1'
        self.query_property_dropped_user = 'SELECT "properties" FROM "events" WHERE "datasource_id"=%(ds_id)s AND "user_id"=%(user_id)s ORDER BY "timestamp" DESC LIMIT 1'
        self.paramaeters = [
            {
                "ds_id": "datasource_id",
                "user_id": "user_id",
                "event": "event_name",
            },
            {
                "ds_id": "datasource_id",
                "user_id": "user_id",
            },
            {
                "ds_id": "datasource_id",
                "user_id": "user_id",
            },
        ]
        self.repo = User()
        self.user_id = "user_id"
        self.datasource_id = "datasource_id"
        self.event_name = "event_name"

    def test_build_get_user_properties_query_without_event(self):
        query, parameter = self.repo.build_get_user_properties_query(
            user_id=self.user_id,
            datasource_id=self.datasource_id,
            event=None,
        )
        assert query == self.query_property_without_events
        assert parameter == self.paramaeters[1]

    def test_build_get_user_properties_query_with_event(self):
        query, parameter = self.repo.build_get_user_properties_query(
            user_id=self.user_id,
            datasource_id=self.datasource_id,
            event=self.event_name,
        )
        assert query == self.query_property_with_events
        assert parameter == self.paramaeters[0]

    def test_build_get_dropped_user_properties_query(self):
        query, parameter = self.repo.build_get_user_properties_query(
            user_id=self.user_id,
            datasource_id=self.datasource_id,
            event="",
        )
        assert query == self.query_property_without_events
        assert parameter == self.paramaeters[2]
