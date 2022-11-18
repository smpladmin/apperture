from abc import ABC, abstractmethod
from datetime import date
from dateutil.relativedelta import relativedelta


class Strategy(ABC):
    @abstractmethod
    def execute(self, email: str, external_source_id: str):
        raise NotImplementedError()

    def get_dates(self):
        start_date = (date.today() + relativedelta(months=-1)).replace(day=1)
        end_date = date.today() + relativedelta(days=-1)
        return start_date, end_date
