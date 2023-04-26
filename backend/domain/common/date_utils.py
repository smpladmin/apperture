from datetime import datetime, timedelta
from typing import Tuple, Union

from domain.common.date_models import (
    FixedDateFilter,
    LastDateFilter,
    SinceDateFilter,
    DateFilterType,
)


class DateUtils:
    def __init__(self):
        self.date_format = "%Y-%m-%d"

    def compute_date_filter(
        self,
        date_filter: Union[FixedDateFilter, LastDateFilter, SinceDateFilter],
        date_filter_type: DateFilterType,
    ) -> Tuple[str, str]:
        if date_filter_type == DateFilterType.FIXED:
            return date_filter.start_date, date_filter.end_date

        today = datetime.today()
        end_date = today.strftime(self.date_format)

        return (
            (date_filter.start_date, end_date)
            if date_filter_type == DateFilterType.SINCE
            else (
                (today - timedelta(days=date_filter.days)).strftime(self.date_format),
                end_date,
            )
        )

    def compute_days_in_date_range(self, start_date: str, end_date: str) -> int:
        return (
            datetime.strptime(end_date, self.date_format)
            - datetime.strptime(start_date, self.date_format)
        ).days

    def compute_n_days_ago_date(
        self, days_ago: int, date_format: str = "%Y-%m-%d"
    ) -> str:
        today = datetime.today()
        return (today - timedelta(days=days_ago)).strftime(date_format)

    def compare_dates(
        self, end_date: str, date: str, date_format: str = "%Y-%m-%d"
    ) -> bool:
        end_date_obj = datetime.strptime(end_date, date_format)
        date_obj = datetime.strptime(date, date_format)

        return date_obj > end_date_obj
