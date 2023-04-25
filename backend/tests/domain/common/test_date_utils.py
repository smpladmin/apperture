from domain.common.date_utils import DateUtils


class TestDateUtils:
    def setup_method(self):
        self.service = DateUtils()

    def test_compute_days_in_date_range(self):
        assert (
            self.service.compute_days_in_date_range(
                start_date="2022-01-01", end_date="2022-02-01"
            )
            == 31
        )
