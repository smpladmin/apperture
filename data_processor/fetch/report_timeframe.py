from enum import Enum


class ReportTimeframe(Enum):
    DAILY = "daily"
    MONTHLY = "monthly"

    def google_analytics_name(self):
        switcher = {ReportTimeframe.DAILY: "date", ReportTimeframe.MONTHLY: "month"}
        return switcher.get(self)
