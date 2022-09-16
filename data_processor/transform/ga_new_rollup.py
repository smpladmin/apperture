import re
import logging
import numpy as np
import pandas as pd
from copy import deepcopy

from .transformer import Transformer

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


class NetworkGraphTransformer(Transformer):

    """
    This is a class which Transforms cleaned GA data to Network graph data using rollup.

    Attributes:
        lvl_thresholds (list): Thresholds in percentage for individual levels.
        global_threshold (int): Global threshold in percentage, common for all levels.
        last_viable_lvl (int): No. of levels to consider.
        rollup_start_lvl (int): Level at which rollup starts.
        rollup_end_lvl (int): Level at which rollup ends.
    """

    def __init__(
        self,
        lvl_thresholds=None,
        global_threshold=0.1,
        last_viable_lvl=10,
        rollup_start_lvl=5,
        rollup_end_lvl=2,
    ):

        super().__init__()

        self.global_threshold = global_threshold
        if lvl_thresholds:
            self.lvl_thresholds = lvl_thresholds
        else:
            self.lvl_thresholds = [40, 20, 10, 5]
        self.last_viable_lvl = last_viable_lvl
        self.rollup_start_lvl = rollup_start_lvl
        self.rollup_end_lvl = rollup_end_lvl

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        logging.info("{msg}: {x}".format(msg="NetworkGraphTransformer", x="starts"))
        cleaned_df = deepcopy(df)
        cleaned_df["pagePath"] = cleaned_df["pagePath"].apply(
            lambda x: re.sub("/[\d]+", "/:id", x)
        )
        cleaned_df["previousPage"] = cleaned_df["previousPage"].apply(
            lambda x: re.sub("/[\d]+", "/:id", x)
        )

        df = df.groupby(
            by=["previousPage", "pagePath"], sort=False, as_index=False
        ).agg(lambda x: x.sum())
        df = df.drop(columns=["date"])
        df = df.reset_index(drop=True)
        logging.info(
            "{msg}: {x}".format(
                msg="No. of unique URLs before regex ", x=df["pagePath"].nunique()
            )
        )

        # Replacing ids with a placeholder.
        df["pagePath"] = df["pagePath"].apply(lambda x: re.sub("/[\d]+", "/:id", x))
        df["previousPage"] = df["previousPage"].apply(
            lambda x: re.sub("/[\d]+", "/:id", x)
        )

        logging.info(
            "{msg}: {x}".format(
                msg="No. of unique URLs after regex ", x=df["pagePath"].nunique()
            )
        )

        # Calculating global_threshold in terms of pageviews
        total_pageviews = df["pageViews"].sum()
        self.global_threshold = int((self.global_threshold / 100) * total_pageviews)

        # Generating rolled urls.
        rollup_df = self.generate_rolled_urls(df[["pagePath", "pageViews"]])
        rolled_urls = rollup_df["rolled_url"].tolist()

        # Generating a map of original url vs rolled url.
        map_df = NetworkGraphTransformer.create_rollup_map(
            df[["pagePath"]], rolled_urls
        )
        map_df = map_df.set_index("pagePath")
        map_dict = map_df.to_dict()
        map_dict = map_dict["rolled_url"]

        cleaned_df["pagePath"] = cleaned_df["pagePath"].apply(
            lambda x: map_dict.get(x, x)
        )
        cleaned_df["previousPage"] = cleaned_df["previousPage"].apply(
            lambda x: map_dict.get(x, x)
        )
        cleaned_df = cleaned_df[cleaned_df["previousPage"] != cleaned_df["pagePath"]]
        cleaned_df = cleaned_df.groupby(
            by=["previousPage", "pagePath", "date"], sort=False, as_index=False
        ).agg(lambda x: x.sum())

        logging.info("{msg}: {x}".format(msg="NetworkGraphTransformer", x="ends"))
        return cleaned_df

    # Creates a map of original url vs rolled url
    @staticmethod
    def create_rollup_map(map_df, rolled_urls):
        logging.info("{msg}: {x}".format(msg="Create Rollup Map", x="starts"))
        map_df = map_df.drop_duplicates()
        map_df.reset_index(drop=True, inplace=True)
        for i, page in enumerate(map_df["pagePath"]):
            x = 0
            if page in rolled_urls:
                map_df.loc[i, "rolled_url"] = page
            else:
                for rolled_url in rolled_urls:
                    if rolled_url in page:
                        if (page[: len(rolled_url)] == rolled_url) and (
                            len(rolled_url) > x
                        ):
                            x = len(rolled_url)
                            map_df.loc[i, "rolled_url"] = rolled_url
                        else:
                            continue
                    else:
                        continue

        logging.info("{msg}: {x}".format(msg="Create Rollup Map", x="ends"))
        return map_df

    @staticmethod
    def augment(x, i):
        try:
            return x.split("/")[i]
        except:
            return np.nan

    # Creates lvl columns
    def create_lvls(self, df: pd.DataFrame) -> pd.DataFrame:
        df["lvl0"] = "/"
        for i in range(1, 10):
            df["lvl{}".format(i)] = df["pagePath"].apply(
                lambda x: NetworkGraphTransformer.augment(x, i)
            )
            if len(df[pd.notna(df["lvl{}".format(i)])]) == 0:
                self.last_viable_lvl = i - 1
                df = df.drop(columns=["lvl{}".format(i)])
                break
        return df

    # Automatically roll-ups for higher levels.
    @staticmethod
    def auto_rollup(df: pd.DataFrame) -> pd.DataFrame:
        lvl_columns = [x for x in df.columns if "lvl" in x]
        for i, row in df.iterrows():
            df.loc[i, "rolled_url"] = "/".join(row[lvl_columns].dropna().tolist())[1:]
        df = df[["rolled_url", "pageViews"]]
        df = df.groupby("rolled_url", sort=False, as_index=False).agg(lambda x: x.sum())
        return df

    # Rolls up for individual level using thresholds.
    def levelwise_rollup(self, data, lvl, threshold):
        logging.info("{msg}: {x}".format(msg="Level-wise rollup", x="starts"))
        logging.info(
            "{msg}: {x}".format(
                msg="Total PageViews Count before rollup", x=data["pageViews"].sum()
            )
        )

        curr_lvl_col = "lvl{}".format(lvl)
        for i in range(1, lvl + 1):
            data["lvl{}".format(i)] = data["rolled_url"].apply(
                lambda x: NetworkGraphTransformer.augment(x, i)
            )
        data1 = data[pd.notna(data[curr_lvl_col])]
        data2 = data[pd.isna(data[curr_lvl_col])][["rolled_url", "pageViews"]]

        res = []
        prev_lvls = ["lvl{}".format(i) for i in range(1, lvl)]
        for i, idf in data1.groupby(by=prev_lvls):
            idf = idf.sort_values(by=["pageViews"], ascending=False)
            tot_pageviews = idf["pageViews"].sum()
            idf["pct_pageviews"] = idf["pageViews"] * 100 / tot_pageviews
            x2 = idf[
                (idf["pct_pageviews"] > threshold)
                & (idf["pageViews"] > self.global_threshold)
            ][["rolled_url", "pageViews"]]
            x1 = idf[~idf.index.isin(x2.index)]
            x1 = x1.reset_index(drop=True)
            if len(x2) > 0:
                res.append(x2)
            if len(x1) == 0:
                continue
            x1_pv = x1["pageViews"].sum()
            url = "/".join(x1.loc[0, "rolled_url"].split("/")[:lvl])
            x3 = pd.DataFrame([[url, x1_pv]], columns=["rolled_url", "pageViews"])
            res.append(x3)

        res_df = pd.concat(res)
        res_df = res_df.append(data2)
        res_df = res_df.groupby("rolled_url", sort=False, as_index=False).agg(
            lambda x: x.sum()
        )

        logging.info(
            "{msg}: {x}".format(
                msg="Total PageViews Count after rollup", x=res_df["pageViews"].sum()
            )
        )
        logging.info("{msg}: {x}".format(msg="Level-wise rollup", x="ends"))
        return res_df

    # Wrapper on level_wise_rollup for multi-level rollup.
    def multilevel_rollup(self, input_df):
        logging.info("{msg}: {x}".format(msg="Mutli-level rollup", x="starts"))

        init_lvl = self.rollup_start_lvl
        for threshold in self.lvl_thresholds:
            logging.info("{msg}: {x}".format(msg="Rolling up for lvl", x=init_lvl))
            if init_lvl < self.rollup_end_lvl:
                logging.info("{msg}: {x}".format(msg="End lvl reached", x="exiting"))
                return input_df
            input_df = self.levelwise_rollup(input_df, init_lvl, threshold)
            init_lvl -= 1

        logging.info("{msg}: {x}".format(msg="Mutli-level rollup", x="ends"))
        return input_df

    # Generates rolled urls from existing urls based on levels and thresholds.
    def generate_rolled_urls(self, df: pd.DataFrame) -> pd.DataFrame:
        logging.info("{msg}: {x}".format(msg="Generating rolled urls", x="starts"))
        df = df.groupby("pagePath", sort=False, as_index=False).agg(lambda x: x.sum())
        df = df.drop_duplicates(subset=["pagePath"])
        df = self.create_lvls(df)

        if self.last_viable_lvl > self.rollup_start_lvl:
            logging.info(
                "{msg}: {x}".format(msg="Automatic rollup for higher lvls", x="starts")
            )
            df = NetworkGraphTransformer.auto_rollup(df)
            logging.info(
                "{msg}: {x}".format(msg="Automatic rollup for higher lvls", x="ends")
            )

        else:
            df["rolled_url"] = df["pagePath"]
            self.rollup_start_lvl = self.last_viable_lvl
            self.lvl_thresholds = self.lvl_thresholds[self.rollup_start_lvl - 1 :]

        rollup_df = self.multilevel_rollup(df[["rolled_url", "pageViews"]])

        logging.info("{msg}: {x}".format(msg="Generating rolled urls", x="ends"))
        return rollup_df
