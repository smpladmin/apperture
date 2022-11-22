import io
from math import isnan
import zipfile
import zlib
import pandas as pd
from flatten_json import flatten

from .event_processor import EventProcessor


class AmplitudeEventProcessor(EventProcessor):
    def process(self, events_data):
        agg_df = self.zip_to_dataframe(events_data)
        return self.process_dataframe(agg_df)

    def zip_to_dataframe(self, events_data):
        agg_df = pd.DataFrame()
        with zipfile.ZipFile(io.BytesIO(events_data)) as zip_source:
            for info in zip_source.infolist():
                file_bytes = zip_source.read(info.filename)
                json = zlib.decompress(file_bytes, 15 + 32)
                df = pd.read_json(json.decode("utf8"), lines=True)
                agg_df = pd.concat([agg_df, df])
        return agg_df

    def process_dataframe(self, agg_df):
        flattened_data = [flatten(d, ".") for d in agg_df.to_dict("records")]
        flattened_df = pd.DataFrame(flattened_data)
        cleaned_df = pd.DataFrame()
        if pd.api.types.is_float_dtype(flattened_df.user_id):
            cleaned_df["userId"] = (
                flattened_df.user_id.astype("Int64")
                .astype("string")
                .fillna(flattened_df.device_id)
            )
        else:
            cleaned_df["userId"] = flattened_df.user_id.astype("string").fillna(
                flattened_df.device_id
            )
        cleaned_df["timestamp"] = flattened_df.event_time.dt.strftime(
            "%Y-%m-%d %H:%M:%S"
        )
        cleaned_df["eventName"] = flattened_df.event_type
        cleaned_df["properties"] = flattened_df.to_dict(orient="records")
        return cleaned_df
