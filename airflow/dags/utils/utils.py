import re
from datetime import datetime

DATA_FETCH_DAYS_OFFSET = 100
AIRFLOW_INIT_DATE = datetime(2023, 10, 20, 0, 0, 0, 0)


def replace_invalid_characters(input_string):
    pattern = r"[^a-zA-Z0-9\-\._]+"
    replaced_string = re.sub(pattern, "_", input_string)
    return replaced_string
