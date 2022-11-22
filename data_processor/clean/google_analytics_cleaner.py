import re
import babel
import logging
import pandas as pd

from .cleaner import Cleaner


class GoogleAnalyticsCleaner(Cleaner):
    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        logging.info("{x}: {y}".format(x="Cleaning GA data of length", y=len(df)))
        self.convert_data_types(df)
        self.remove_query_params_from_path(df)
        self.convert_url_to_path(df)
        logging.info("{x}: {y}".format(x="Length of df after cleanup", y=len(df)))
        return df

    def is_valid_locale(self, locale) -> bool:
        try:
            babel.Locale.parse(locale)
        except babel.core.UnknownLocaleError:
            logging.debug("{x}: {y}".format(x="Not a valid locale", y=locale))
            return False
        return True

    def remove_locale_from_endpoint(self, endpoint: str) -> str:
        logging.debug("{x}: {y}".format(x="Processing for", y=endpoint))
        pattern = re.search("/(?P<locale>[a-zA-Z]{2,2}(-[a-zA-Z]{2})?)/", endpoint)
        if not pattern:
            pattern = re.search("/(?P<locale>[a-zA-Z]{2,2}(-[a-zA-Z]{2})?)$", endpoint)

        if not pattern:
            logging.debug("{x}: {y}".format(x="Pattern not present", y="Skipping"))
            return endpoint
        else:
            locale = pattern.group("locale").replace("-", "_")
            reversed_locale = "_".join(locale.split("_")[::-1])
            if not (
                self.is_valid_locale(locale) or self.is_valid_locale(reversed_locale)
            ):
                return endpoint

            res = endpoint.replace("/" + pattern.group("locale"), "")
            logging.info(
                "{x}: {y}".format(x="Removed locale for {0}".format(endpoint), y=res)
            )
            return res

    def convert_url_to_endpoint(self, url: str) -> str:
        endpoint = re.search("(?P<domain>.+(\.\w{2,})+)(?P<endpoint>/.*)", url)
        if endpoint:
            endpoint = endpoint.group("endpoint")
            logging.info(
                "{x}: {y}".format(x="Converted {0} to".format(url), y=endpoint)
            )
            return endpoint
        else:
            return url

    def convert_url_to_path(self, df):
        df["previousPage"] = df["previousPage"].apply(self.convert_url_to_endpoint)
        df["previousPage"] = df["previousPage"].apply(self.remove_locale_from_endpoint)
        df["pagePath"] = df["pagePath"].apply(self.convert_url_to_endpoint)
        df["pagePath"] = df["pagePath"].apply(self.remove_locale_from_endpoint)

    def convert_data_types(self, df):
        df["pageViews"] = pd.to_numeric(df["pageViews"])
        df["users"] = pd.to_numeric(df["users"])

    def remove_query_params_from_path(self, df):
        df["previousPage"] = df.apply(
            lambda x: x["previousPage"].split("?", 1)[0], axis=1
        )
        df["pagePath"] = df.apply(lambda x: x["pagePath"].split("?", 1)[0], axis=1)
