import pandas as pd
import numpy as np
from .transformer import Transformer


class NetworkGraphTransformer(Transformer):
    """
    Create 2 tables for significance and clutter
        Table 1 : how many L2 have >=4 L3 nodes
        Table 2 : how many L3 have pageViews < 1% of the total pageviews
    The L3 nodes that will be rolled up to L2 level are those which are there in both Tables
    """

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        l2with_above4_l3, l3with_significance = self.transform_for_page_path(df)
        self.transform_for_previous_page_path(df, l2with_above4_l3, l3with_significance)
        transformed = self.transform_to_plot(df)
        self.print_transformed_data(transformed)
        return transformed

    def print_transformed_data(self, transformed):
        print("Transformed data")
        with pd.option_context(
            "display.max_columns",
            None,
            "display.expand_frame_repr",
            False,
            "max_colwidth",
            None,
        ):
            print(transformed)

    def transform_to_plot(self, df):
        data_to_plot = (
            df.groupby(["previousnode_id", "node_id"])
            .apply(lambda grp: grp.agg({"users": "sum"}))
            .reset_index()
            .sort_values(by="users", ascending=False)
            .reset_index()
        )
        data_to_plot.columns = ["index", "previousPage", "pagePath", "users"]
        data_to_plot = data_to_plot.loc[
            data_to_plot["users"] >= np.sum(data_to_plot.users) * 0.005
        ]
        data_to_plot = data_to_plot.loc[
            data_to_plot.previousPage != data_to_plot.pagePath
        ]
        data_to_plot = data_to_plot.drop(columns=["index"]).reset_index(drop=True)
        return data_to_plot

    def transform_for_previous_page_path(
        self, df, l2with_above4_l3, l3with_significance
    ):
        self.create_previous_page_path_levels(df)
        self.update_previous_node_id(df, l2with_above4_l3, l3with_significance)

    def update_previous_node_id(self, df, l2with_above4_l3, l3with_significance):
        df.loc[
            df["previousPageL2"].isin(l2with_above4_l3["pagePathL2"]), "previousnode_id"
        ] = df.loc[df["previousPageL2"].isin(l2with_above4_l3["pagePathL2"])].apply(
            lambda x: x["previousPageL2"], axis=1
        )
        df.loc[
            ~df["previousPageL2"].isin(l2with_above4_l3["pagePathL2"]),
            "previousnode_id",
        ] = df.loc[~df["previousPageL2"].isin(l2with_above4_l3["pagePathL2"])].apply(
            lambda x: (x["previousPageL2"] + "/" + x["previousPageL3"])
            if len(x["previousPageL3"]) > 0
            else x["previousPageL2"],
            axis=1,
        )
        df.loc[
            df["previousPageL3"].isin(l3with_significance["pagePathL3"]),
            "previousnode_id",
        ] = df.loc[df["previousPageL3"].isin(l3with_significance["pagePathL3"])].apply(
            lambda x: (x["previousPageL2"] + "/" + x["previousPageL3"])
            if len(x["previousPageL3"]) > 0
            else x["previousPageL2"],
            axis=1,
        )
        df.loc[df["previousPage"] == "(entrance)", "previousnode_id"] = "Entrance"
        df.loc[df["previousPage"] == "/", "previousnode_id"] = "/"

    def transform_for_page_path(self, df):
        self.create_page_path_levels(df)
        count_l3 = self.count_level3(df)
        l2with_above4_l3 = self.level2_with_more_than_4_level3(count_l3)
        l3significance = self.level3_significance(df)
        total_page_views = np.sum(df.pageViews)
        l3with_significance = l3significance[
            l3significance["pageViews"] >= 0.01 * total_page_views
        ][["pagePathL3", "pageViews"]]
        self.mark_rows_for_rollup(df, l2with_above4_l3, l3with_significance)
        df.loc[df["pagePath"] == "/", "node_id"] = "/"
        return l2with_above4_l3, l3with_significance

    def create_previous_page_path_levels(self, df):
        paths = df.previousPage.str.split("/", expand=True)
        df["previousPageL2"] = paths.get(1)
        df["previousPageL3"] = paths.get(2)
        df["previousPageL4"] = paths.get(3)
        df[["previousPageL2", "previousPageL3", "previousPageL4"]] = df[
            ["previousPageL2", "previousPageL3", "previousPageL4"]
        ].replace({None: ""})

    def mark_rows_for_rollup(self, df, l2with_above4_l3, l3with_significance):
        df.loc[df["pagePathL2"].isin(l2with_above4_l3["pagePathL2"]), "rollup"] = True
        df.loc[
            df["pagePathL2"].isin(l2with_above4_l3["pagePathL2"]), "node_id"
        ] = df.loc[df["pagePathL2"].isin(l2with_above4_l3["pagePathL2"])].apply(
            lambda x: x["pagePathL2"], axis=1
        )
        df.loc[~df["pagePathL2"].isin(l2with_above4_l3["pagePathL2"]), "rollup"] = False
        df.loc[
            ~df["pagePathL2"].isin(l2with_above4_l3["pagePathL2"]), "node_id"
        ] = df.loc[~df["pagePathL2"].isin(l2with_above4_l3["pagePathL2"])].apply(
            lambda x: (x["pagePathL2"] + "/" + x["pagePathL3"])
            if len(x["pagePathL3"]) > 0
            else x["pagePathL2"],
            axis=1,
        )
        df.loc[
            df["pagePathL3"].isin(l3with_significance["pagePathL3"]), "rollup"
        ] = False
        df.loc[
            df["pagePathL3"].isin(l3with_significance["pagePathL3"]), "node_id"
        ] = df.loc[df["pagePathL3"].isin(l3with_significance["pagePathL3"])].apply(
            lambda x: (x["pagePathL2"] + "/" + x["pagePathL3"])
            if len(x["pagePathL3"]) > 0
            else x["pagePathL2"],
            axis=1,
        )

    def level2_with_more_than_4_level3(self, count_l3):
        return count_l3[count_l3["pagePathL3"] >= 4][["pagePathL2", "pagePathL3"]]

    def level3_significance(self, df):
        return (
            df.groupby(["pagePathL3"])["pageViews"]
            .apply(lambda grp: grp.agg({"pageViews": "sum"}))
            .reset_index()
            .sort_values(by="pageViews", ascending=False)
            .reset_index()
        )

    def count_level3(self, df):
        return (
            df.groupby(["pagePathL2"])["pagePathL3"]
            .apply(lambda grp: grp.agg({lambda x: x.nunique()}))
            .reset_index()
            .sort_values(by="pagePathL3", ascending=False)
            .reset_index()
        )

    def create_page_path_levels(self, df):
        paths = df.pagePath.str.split("/", expand=True)
        df["pagePathL2"] = paths.get(1)
        df["pagePathL3"] = paths.get(2)
        df["pagePathL4"] = paths.get(3)
        df[["pagePathL2", "pagePathL3", "pagePathL4"]] = df[
            ["pagePathL2", "pagePathL3", "pagePathL4"]
        ].replace({None: ""})
