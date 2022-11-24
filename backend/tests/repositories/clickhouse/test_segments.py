from domain.segments.models import SegmentFilter
from repositories.clickhouse.segments import Segments


class TestSegmentsRepository:
    def setup_method(self):
        self.repo = Segments()

    def test_build_segment_query(self):
        ds_id = "mock-ds-id"
        filters = [
            SegmentFilter(event="otp_sent"),
            SegmentFilter(event="log_in_clicked"),
        ]

        query, params = self.repo.build_segment_query(ds_id, filters)

        assert params == {
            "ds_id": ds_id,
            "event0": "otp_sent",
            "event1": "log_in_clicked",
        }
        assert query == (
            'SELECT "user_id",'
            'COUNT(CASE WHEN "event_name"=%(event0)s THEN 1 END) AS "event0",'
            'COUNT(CASE WHEN "event_name"=%(event1)s THEN 1 END) AS "event1" '
            'FROM "events" '
            'WHERE "datasource_id"=%(ds_id)s '
            'GROUP BY "user_id" '
            'ORDER BY "event0" DESC'
        )

    def test_build_segment_query_without_filters(self):
        ds_id = "mock-ds-id"
        filters = []

        query, params = self.repo.build_segment_query(ds_id, filters)

        assert params == {"ds_id": ds_id}
        assert query == (
            'SELECT "user_id" '
            'FROM "events" '
            'WHERE "datasource_id"=%(ds_id)s '
            'GROUP BY "user_id"'
        )

    def test_build_segment_query_filters_with_operator(self):
        ds_id = "mock-ds-id"
        filters = [
            SegmentFilter(event="otp_sent", operator="ge", operand=5),
            SegmentFilter(event="log_in_clicked", operator="lt", operand=5),
            SegmentFilter(event="add_to_cart", operator="eq", operand=1),
        ]

        query, params = self.repo.build_segment_query(ds_id, filters)

        assert params == {
            "ds_id": ds_id,
            "event0": "otp_sent",
            "event1": "log_in_clicked",
            "event2": "add_to_cart",
        }
        assert query == (
            'SELECT "user_id",'
            'COUNT(CASE WHEN "event_name"=%(event0)s THEN 1 END) AS "event0",'
            'COUNT(CASE WHEN "event_name"=%(event1)s THEN 1 END) AS "event1",'
            'COUNT(CASE WHEN "event_name"=%(event2)s THEN 1 END) AS "event2" '
            'FROM "events" '
            'WHERE "datasource_id"=%(ds_id)s '
            'GROUP BY "user_id" '
            'HAVING "event0">=5 AND "event1"<5 AND "event2"=1 '
            'ORDER BY "event0" DESC'
        )
