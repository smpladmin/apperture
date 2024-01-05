import re
from datetime import datetime, timedelta
from typing import Optional

from domain.datamart.models import Frequency

DATA_FETCH_DAYS_OFFSET = 14
BRANCH_DATA_FETCH_DAYS_OFFSET = 7
FACEBOOK_ADS_DATA_FETCH_DAYS_OFFSET = 2
AIRFLOW_INIT_DATE = datetime(2023, 10, 25, 0, 0, 0, 0)
DAG_RETRIES = 3
DAG_RETRY_DELAY = 5  # (in minutes)


def replace_invalid_characters(input_string):
    pattern = r"[^a-zA-Z0-9\-\._]+"
    replaced_string = re.sub(pattern, "_", input_string)
    return replaced_string


FREQUENCY_DELTAS = {
    Frequency.HOURLY: timedelta(hours=1),
    Frequency.DAILY: timedelta(days=1),
    Frequency.WEEKLY: timedelta(weeks=1),
    Frequency.MONTHLY: timedelta(days=31),
}


def get_cron_expression(
    time_str: str, period: str, day: Optional[str], date: Optional[str]
):
    time_obj = datetime.strptime(time_str + " " + period, "%I:%M %p")
    hour_24 = time_obj.strftime("%H")
    minute = time_obj.strftime("%M")

    if day:
        days_of_week = {
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6,
            "Sunday": 0,
        }

        cron_day = days_of_week[day]
        return f"{minute} {hour_24} * * {cron_day}"

    if date:
        day = date.split("-")[2]  # date format is YYYY-MM-DD
        return f"{minute} {hour_24} {day} * *"

    return f"{minute} {hour_24} * * *"
