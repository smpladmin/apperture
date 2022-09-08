import pandas as pd
from .saver import Saver


class NetworkGraphSaver(Saver):
    def __init__(self):
        self.table = "visualization_data"
        self.schema = "perpendicular"

    def save(self, view_id: str, df: pd.DataFrame):
        print(f"Saving to {self.schema}.{self.table}")
        df["view_id"] = view_id
        df = df.rename(
            columns={"previousPage": "previous_page", "pagePath": "page_path"}
        )
        print(df)
        df.to_sql(
            "visualization_data",
            if_exists="append",
            schema="perpendicular",
            index=False,
        )
        print("SAVED")
