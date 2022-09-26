import logging
from .cleaner import Cleaner
import pandas as pd


class GoogleAnalyticsCleaner(Cleaner):
    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        logging.info("{x}: {y}".format(x='Cleaning GA data of length', y=len(df)))
        self.convert_data_types(df)
        self.remove_query_params_from_path(df)
        self.remove_tenant_base_url_from_path(df)
        self.remove_tenant_weblight_base_url_from_path(df)
        self.remove_tenant_google_ad_base_url_from_path(df)
        logging.info("{x}: {y}".format(x='Length of df after cleanup', y=len(df)))
        return df

    def convert_data_types(self, df):
        df["pageViews"] = pd.to_numeric(df["pageViews"])
        df["users"] = pd.to_numeric(df["users"])

    def remove_query_params_from_path(self, df):
        df["previousPage"] = df.apply(
            lambda x: x["previousPage"].split("?", 1)[0], axis=1
        )
        df["pagePath"] = df.apply(lambda x: x["pagePath"].split("?", 1)[0], axis=1)

    def remove_tenant_base_url_from_path(self, df):
        df["previousPage"] = df.apply(
            lambda x: x["previousPage"]
            .replace("www.sangeethamobiles.com", "")
            .replace("googleweblight.com", "")
            .replace(".", "/")
            .replace("//", "/")
            .replace("www/sangeethamobiles", ""),
            axis=1,
        )
        df["pagePath"] = df.apply(
            lambda x: x["pagePath"]
            .replace("www.sangeethamobiles.com", "")
            .replace("googleweblight.com", "")
            .replace(".", "/")
            .replace("//", "/")
            .replace("www/sangeethamobiles", ""),
            axis=1,
        )

    def remove_tenant_weblight_base_url_from_path(self, df):
        df["previousPage"] = df.apply(
            lambda x: x["previousPage"].replace(
                "www-sangeethamobiles-com/translate/goog", ""
            ),
            axis=1,
        )
        df["pagePath"] = df.apply(
            lambda x: x["pagePath"].replace(
                "www-sangeethamobiles-com/translate/goog", ""
            ),
            axis=1,
        )

    def remove_tenant_google_ad_base_url_from_path(self, df):
        df["previousPage"] = df.apply(
            lambda x: x["previousPage"].replace(
                "www/googleadservices/com/pagead/aclk", ""
            ),
            axis=1,
        )
        df["pagePath"] = df.apply(
            lambda x: x["pagePath"].replace("www/googleadservices/com/pagead/aclk", ""),
            axis=1,
        )
