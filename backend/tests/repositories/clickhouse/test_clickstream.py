from repositories.clickhouse.clickstream import Clickstream


class TestClickStreamRepository:
    def setup_method(self):
        self.repository = Clickstream()
        self.datasource_id = "63d8ef5a7b02dbd1dcf20dcc"

    def test_build_get_all_events_query(self):
        query, parameters = self.repository.build_get_all_events_query(
            dsId=self.datasource_id
        )
        assert query == (
            "SELECT "
            '"event","timestamp","user_id","properties.$current_url","properties.$lib",'
            '"properties.$event_type","properties.$elements.tag_name","properties.$elements.$el_text","properties.$elements.attr__href" '
            'FROM "clickstream" WHERE "datasource_id"=%(dsId)s AND "timestamp"<=NOW() '
            'ORDER BY "timestamp" DESC LIMIT 100'
        )
        assert parameters == {"dsId": self.datasource_id}

    def test_build_count_all_events_query(self):
        query, parameters = self.repository.build_count_all_events_query(
            dsId=self.datasource_id
        )
        assert (
            query == 'SELECT COUNT(*) FROM "clickstream" WHERE "datasource_id"=%(dsId)s'
        )
