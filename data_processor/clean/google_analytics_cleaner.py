import re
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

    def remove_locale_from_endpoint(self, url:str)->str:
        endpoint = re.sub("/[a-zA-Z]{2,2}(-[a-zA-Z]{2})?/","/",url)
        # Regext to test locale at end
        endpoint = re.sub("/[a-zA-Z]{2,2}(-[a-zA-Z]{2})?$","/",endpoint) 
        if url != endpoint:
            logging.info("{x}: {y}".format(x="Removed locale for {0}".format(url), y=endpoint))
        return endpoint
    
    def convert_url_to_endpoint(self, url:str)->str:
        endpoint = re.search("(?P<domain>.+(\.\w{2,})+)(?P<endpoint>/.*)",url)
        if endpoint: 
            endpoint=endpoint.group("endpoint") 
            logging.info("{x}: {y}".format(x="Converted {0} to".format(url), y=endpoint))
            return endpoint
        else:
            logging.info("{x}: {y}".format(x="Could not convert", y=url))
            return url

    def convert_url_to_path(self, df):
        df["previousPage"] = df["previousPage"].apply(
            self.convert_url_to_endpoint
        )
        df["previousPage"] = df["previousPage"].apply(
            self.remove_locale_from_endpoint
        )
        df["pagePath"] = df["pagePath"].apply(
            self.convert_url_to_endpoint
        )
        df["pagePath"] = df["pagePath"].apply(
            self.remove_locale_from_endpoint
        )

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
