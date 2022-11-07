import datetime
import logging

import pandas as pd

from .transformer import Transformer


class MixpanelNetworkGraphTransformer(Transformer):
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        pd.set_option("display.max_columns", None)
        df = self.add_counts(df)
        df = self.transform_for_previous_page_path(df)
        transformed = self.transform_to_plot(df)
        self.print_transformed_data(transformed)
        return transformed

    def print_transformed_data(self, transformed):
        logging.info("Transformed data")
        with pd.option_context(
            "display.max_columns",
            None,
            "display.expand_frame_repr",
            False,
            "max_colwidth",
            None,
        ):
            logging.info(transformed)

    def transform_to_plot(self, df):
        date = df["time"].iloc[0]
        logging.info(date)
        date_time = datetime.datetime.fromtimestamp(date)
        date_time = date_time.replace(hour=0, minute=0, second=0, microsecond=0)
        logging.info(date_time)
        df["time"] = date_time

        data_to_plot = (
            df.groupby(
                [
                    "previousnode_id",
                    "node_id",
                    "city",
                    "region",
                    "mp_country_code",
                    "utm_source",
                    "utm_medium",
                    "os",
                    "app_version",
                    "time",
                ]
            )
            .apply(lambda grp: grp.agg({"distinct_id": "count"}))
            .reset_index()
            .sort_values(by="distinct_id", ascending=False)
            .reset_index()
        )

        data_to_plot.columns = [
            "index",
            "previousPage",
            "pagePath",
            "city",
            "region",
            "country",
            "utmSource",
            "utmMedium",
            "os",
            "appVersion",
            "time",
            "pageViews",
        ]

        # data_to_plot['time'] = pd.to_datetime(data_to_plot['time'], unit='s')
        # data_to_plot = data_to_plot.loc[data_to_plot['pageViews'] >=
        #                                 np.sum(data_to_plot.pageViews) * float(os.getenv('MIXPANEL_MIN_PAGE_VIEWS'))]
        data_to_plot = data_to_plot.loc[
            data_to_plot.previousPage != data_to_plot.pagePath
        ]
        data_to_plot = data_to_plot.drop(columns=["index"]).reset_index(drop=True)
        return data_to_plot

    def add_counts(self, df):
        cnts = (
            df[["distinct_id"]]
            .groupby(["distinct_id"])
            .size()
            .reset_index(name="counts")
        )
        df = df.merge(cnts, on="distinct_id")
        return df

    def transform_for_previous_page_path(self, df):
        df["previousevent"] = (
            df.sort_values(by=["time", "eventname"], ascending=True)
            .groupby(["distinct_id"])["eventname"]
            .shift(1)
        )
        df.dropna(subset=["previousevent"], inplace=True)
        df = df.loc[
            ~df["eventname"].isin(
                [
                    "$ae_first_open",
                    "$ae_updated",
                    "$ae_crashed",
                    "$ae_session",
                    "$ae_iap",
                ]
            )
        ]
        df = df.loc[
            ~df["previousevent"].isin(
                [
                    "$ae_first_open",
                    "$ae_updated",
                    "$ae_crashed",
                    "$ae_session",
                    "$ae_iap",
                ]
            )
        ]
        df.rename(
            columns={"eventname": "node_id", "previousevent": "previousnode_id"},
            inplace=True,
        )
        return df
