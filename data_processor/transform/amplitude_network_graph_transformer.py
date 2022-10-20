import datetime
import logging

import pandas as pd

from .transformer import Transformer


class AmplitudeNetworkGraphTransformer(Transformer):
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
        date_format = "%Y-%m-%d" 
        date_time = datetime.datetime.strptime(date[:10],date_format)
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
                    "os",
                    "time",
                ],
                dropna=False
            )
            .apply(lambda grp: grp.agg({"user_id": "count"}))
            .reset_index()
            .sort_values(by="user_id", ascending=False)
            .reset_index()
        ) 

        data_to_plot = data_to_plot.loc[
            data_to_plot.previousnode_id != data_to_plot.node_id
        ]
        data_to_plot = data_to_plot.drop(columns=["index"]).reset_index(drop=True)
        data_to_plot.rename(
            columns={"node_id": "pagePath", "previousnode_id": "previousPage","user_id":"pageViews"},
            inplace=True,
        )
        return data_to_plot

    def add_counts(self, df):
        cnts = (
            df[["user_id"]]
            .groupby(["user_id"])
            .size()
            .reset_index(name="counts")
        )
        df = df.merge(cnts, on="user_id")
        return df

    def transform_for_previous_page_path(self, df):
        df["previousevent"] = (
            df.sort_values(by=["event.timestamp", "event.name"], ascending=True)
            .groupby(["user_id"])["event.name"]
            .shift(1)
        )
        df.dropna(subset=["previousevent"], inplace=True)
        df.dropna(subset=["event.name"], inplace=True)
        
        df.rename(
            columns={"event.name": "node_id", "previousevent": "previousnode_id","event.timestamp":"time","os_name":"os","country":"mp_country_code"},
            inplace=True,
        )
        return df
