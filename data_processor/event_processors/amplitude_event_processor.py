import io
import zipfile
import zlib
import pandas as pd

from .event_processor import EventProcessor


class AmplitudeEventProcessor(EventProcessor):
    def process(self, events_data):
        agg_df = pd.DataFrame()
        with zipfile.ZipFile(io.BytesIO(events_data)) as zip_source:
            for info in zip_source.infolist():
                file_bytes = zip_source.read(info.filename)
                json = zlib.decompress(file_bytes, 15 + 32)
                df = pd.read_json(json.decode("utf8"), lines=True)
                agg_df = pd.concat([agg_df, df])

        event_properties = pd.json_normalize(agg_df["event_properties"])
        properties = agg_df[
            ["user_id", "os_name", "city", "region", "country", "event_type"]
        ]
        properties = properties.fillna("")
        cleaned_df = event_properties[["name", "timestamp"]]
        cleaned_df["properties"] = properties.to_dict(orient="records")
        cleaned_df.rename(columns={"name": "eventName"}, inplace=True)
        return cleaned_df
