import pandas as pd

from .cleaner import Cleaner


class AmplitudeAnalyticsCleaner(Cleaner):
    def clean(self, df: pd.DataFrame())-> pd.DataFrame():
        df=df.join(pd.json_normalize(df['event_properties']).add_prefix('event.'))
        df=df[['user_id','os_name','city','region','country','event.name','event.timestamp']]
        return df