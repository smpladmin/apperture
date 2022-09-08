import pandas as pd

from transform.network_graph_transformer import NetworkGraphTransformer


class TestNetworkGraphTransformer:
    def setup(self):
        self.df = pd.DataFrame.from_dict(
            {
                "previousPage": {
                    "0": "(entrance)",
                    "1": "(entrance)",
                    "2": "(entrance)",
                    "3": "(entrance)",
                    "4": "(entrance)",
                },
                "pagePath": {
                    "0": "/category/mobile-phones/brand-nokia",
                    "1": "/product-details/oppo-a15-mystery-blue-2gb-ram-32gb-storage/mobmtavdpwcvsr3s",
                    "2": "/product-details/redmi-9-prime-space-blue-4gb-ram-128gb-storage/mobmwjrbx569euwr",
                    "3": "/product-details/vivo-y11-mineral-blue-3gb-ram-32gb-storage/mobq9xs81naany76",
                    "4": "/product-details/vivo-y50-pearl-white-8gb-ram-128gb-storage/mobnyssma65tb6qu",
                },
                "users": {"0": 1, "1": 1, "2": 1, "3": 1, "4": 1},
                "pageViews": {"0": 1, "1": 1, "2": 1, "3": 1, "4": 1},
            }
        )
        self.transformer = NetworkGraphTransformer()

    def test_transform(self):
        """
        Should transform cleaned dataframe to another dataframe which can be used to visualise a network graph
        """
        transformed_df = self.transformer.transform(self.df)

        assert transformed_df.shape == (5, 3)
        assert transformed_df.previousPage.tolist() == [
            "Entrance",
            "Entrance",
            "Entrance",
            "Entrance",
            "Entrance",
        ]
        assert transformed_df.pagePath.tolist() == [
            "category/mobile-phones",
            "product-details/oppo-a15-mystery-blue-2gb-ram-32gb-storage",
            "product-details/redmi-9-prime-space-blue-4gb-ram-128gb-storage",
            "product-details/vivo-y11-mineral-blue-3gb-ram-32gb-storage",
            "product-details/vivo-y50-pearl-white-8gb-ram-128gb-storage",
        ]
        assert transformed_df.users.tolist() == [1, 1, 1, 1, 1]
