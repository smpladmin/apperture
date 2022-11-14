import datetime
import pandas as pd

from .event_processor import EventProcessor


class MixPanelEventProcessor(EventProcessor):
    def process(self, events_data):
        df = pd.read_json(events_data, lines=True)
        df2 = pd.json_normalize(df["properties"])
        df2 = df2.fillna("")
        df2.columns = [str(column).replace("$", "") for column in df2.columns]

        df["properties"] = df2.to_dict("records")
        df["timestamp"] = df2["time"].apply(
            lambda x: datetime.datetime.fromtimestamp(int(x)).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        )
        df["event"] = df["event"].str.replace(r"\$", "", regex=True)
        df.rename(columns={"event": "eventName"}, inplace=True)

        return df
