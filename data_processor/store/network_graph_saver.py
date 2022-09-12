import pandas as pd
from .saver import Saver


class NetworkGraphSaver(Saver):
    def __init__(self):
        pass

    def save(self, view_id: str, df: pd.DataFrame):
        df["view_id"] = view_id
        df = df.rename(
            columns={"previousPage": "previous_page", "pagePath": "page_path"}
        )
        print(df)
        print("SAVED")
