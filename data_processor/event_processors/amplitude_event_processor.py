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
        return agg_df
