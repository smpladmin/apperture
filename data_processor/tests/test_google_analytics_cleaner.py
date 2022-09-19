import pandas as pd
import pytest

from clean.google_analytics_cleaner import GoogleAnalyticsCleaner


class TestGoogleAnalyticsCleaner:
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
                    "0": "www.sangeethamobiles.com/category/mobile-phones/brand-nokia?_x_tr_sl=en&_x_tr_tl=pt&_x_tr_hl=pt-pt&_x_tr_pto=sc",
                    "1": "googleweblight.com/product-details/oppo-a15-mystery-blue-2gb-ram-32gb-storage/mobmtavdpwcvsr3s?_x_tr_sl=en&_x_tr_tl=bn&_x_tr_hl=bn&_x_tr_pto=sc",
                    "2": "www.sangeethamobiles.com/product-details/redmi-9-prime-space-blue-4gb-ram-128gb-storage/mobmwjrbx569euwr?_x_tr_sl=en&_x_tr_tl=te&_x_tr_hl=te&_x_tr_pto=sc",
                    "3": "www-sangeethamobiles-com.translate.goog/product-details/vivo-y11-mineral-blue-3gb-ram-32gb-storage/mobq9xs81naany76?_x_tr_sl=en&_x_tr_tl=hi&_x_tr_hl=hi&_x_tr_pto=sc",
                    "4": "www.googleadservices.com.pagead.aclk/product-details/vivo-y50-pearl-white-8gb-ram-128gb-storage/mobnyssma65tb6qu?_x_tr_sl=en&_x_tr_tl=hi&_x_tr_hl=hi&_x_tr_pto=sc",
                },
                "users": {"0": "1", "1": "1", "2": "1", "3": "1", "4": "1"},
                "pageViews": {"0": "1", "1": "1", "2": "1", "3": "1", "4": "1"},
            }
        )
        self.cleaner = GoogleAnalyticsCleaner()

    def test_clean(self):
        """
        Should clean a dataframe output from the fetch stage
        """
        cleaned_df = self.cleaner.clean(self.df)

        assert cleaned_df["pagePath"].tolist() == [
            "/category/mobile-phones/brand-nokia",
            "/product-details/oppo-a15-mystery-blue-2gb-ram-32gb-storage/mobmtavdpwcvsr3s",
            "/product-details/redmi-9-prime-space-blue-4gb-ram-128gb-storage/mobmwjrbx569euwr",
            "/product-details/vivo-y11-mineral-blue-3gb-ram-32gb-storage/mobq9xs81naany76",
            "/product-details/vivo-y50-pearl-white-8gb-ram-128gb-storage/mobnyssma65tb6qu",
        ]
        assert cleaned_df["users"].tolist() == [1, 1, 1, 1, 1]
        assert cleaned_df["pageViews"].tolist() == [1, 1, 1, 1, 1]
        assert cleaned_df["previousPage"].tolist() == [
            "(entrance)",
            "(entrance)",
            "(entrance)",
            "(entrance)",
            "(entrance)",
        ]
