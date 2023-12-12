import pandas as pd
import json
from datetime import datetime

from .event_processor import EventProcessor


class TataIVREventProcessor(EventProcessor):
    def process(self, events_data, datasource_id):
        df = events_data
        self.attributes = [
            "id",
            "call_id",
            "uuid",
            "date",
            "time",
            "end_stamp",
            "missed_agents",
            "status",
            "direction",
            "call_duration",
            "answered_seconds",
            "minutes_consumed",
            "broadcast_id",
            "dtmf_input",
            "client_number",
            "hangup_cause",
            "did_number",
            "contact_details",
            "recording_url",
            "service",
        ]
        self.string_attributes = [
            "id",
            "datasource_id",
            "call_id",
            "uuid",
            "date",
            "time",
            "status",
            "direction",
            "broadcast_id",
            "dtmf_input",
            "client_number",
            "hangup_cause",
            "did_number",
            "contact_details",
            "recording_url",
            "service",
            "missed_agents",
        ]
        return self.process_data(data=df, datasource_id=datasource_id)

    def get_rest_of_the_data(self, df, attributes):
        return df.loc[:, ~df.columns.isin(attributes)]

    def process_data(self, data, datasource_id: str):
        df = pd.json_normalize(data)
        property_df = self.get_rest_of_the_data(df.copy(), self.attributes)
        cleaned_df = pd.DataFrame(df[self.attributes])
        cleaned_df["timestamp"] = df["date"] + " " + df["time"]
        cleaned_df["timestamp"] = cleaned_df["timestamp"].apply(
            lambda x: datetime.strptime(x, "%Y-%m-%d %H:%M:%S")
        )
        cleaned_df["end_stamp"] = cleaned_df["end_stamp"].apply(
            lambda x: datetime.strptime(str(x), "%Y-%m-%d %H:%M:%S")
        )
        cleaned_df["properties"] = property_df.to_dict(orient="records")
        cleaned_df["properties"] = cleaned_df["properties"].apply(json.dumps)
        cleaned_df["properties"] = cleaned_df["properties"].apply(
            lambda x: x.replace("NaN", "null")
        )
        cleaned_df["properties"] = cleaned_df["properties"].apply(json.loads)
        cleaned_df["datasource_id"] = datasource_id
        cleaned_df["call_duration"] = cleaned_df["call_duration"].fillna(0)
        cleaned_df["answered_seconds"] = cleaned_df["answered_seconds"].fillna(0)
        cleaned_df["minutes_consumed"] = cleaned_df["minutes_consumed"].fillna(0)
        for item in self.string_attributes:
            cleaned_df[item] = cleaned_df[item].apply(lambda x: str(x))

        return cleaned_df
