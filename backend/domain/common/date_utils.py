import datetime
from typing import Union

from domain.common.date_models import FixedDateFilter, LastDateFilter, SinceDateFilter, DateFilterType


class DateUtils:
    def __init__(self):
        self.date_format = "%Y-%m-%d"

    def compute_date_filter(
            self,
            date_filter: Union[FixedDateFilter, LastDateFilter, SinceDateFilter],
            date_filter_type: DateFilterType,
    ) -> (str, str):
        if date_filter_type == DateFilterType.FIXED:
            return date_filter.start_date, date_filter.end_date

        today = datetime.datetime.today()
        end_date = today.strftime(self.date_format)

        return (
            (date_filter.start_date, end_date)
            if date_filter_type == DateFilterType.SINCE
            else (
                (today - datetime.timedelta(days=date_filter.days)).strftime(
                    self.date_format
                ),
                end_date,
            )
        )


    def compute_days_in_date_range(self, start_date: str, end_date: str) -> int:
        return (
                datetime.datetime.strptime(end_date, self.date_format)
                - datetime.datetime.strptime(start_date, self.date_format)
        ).days
