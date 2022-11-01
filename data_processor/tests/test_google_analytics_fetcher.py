from fetch.google_analytics_fetcher import GoogleAnalyticsFetcher
from unittest.mock import MagicMock


class TestGoogleAnalyticsFetcher:
    def setup_method(self):
        self.analytics = MagicMock()
        mock_response = {
            "reports": [
                {
                    "columnHeader": {
                        "dimensions": ["ga:date", "ga:previousPagePath", "ga:pagePath"],
                        "metricHeader": {
                            "metricHeaderEntries": [
                                {"name": "ga:users", "type": "INTEGER"},
                                {"name": "ga:pageViews", "type": "INTEGER"},
                            ]
                        },
                    },
                    "data": {
                        "rows": [
                            {
                                "dimensions": [
                                    "20220121",
                                    "(entrance)",
                                    "www-sangeethamobiles-com.translate.goog/category/mobile-phones/brand-nokia?_x_tr_sl=en&_x_tr_tl=pt&_x_tr_hl=pt-pt&_x_tr_pto=sc",
                                ],
                                "metrics": [{"values": ["1", "1"]}],
                            },
                            {
                                "dimensions": [
                                    "20220121",
                                    "(entrance)",
                                    "www-sangeethamobiles-com.translate.goog/product-details/oppo-a15-mystery-blue-2gb-ram-32gb-storage/mobmtavdpwcvsr3s?_x_tr_sl=en&_x_tr_tl=bn&_x_tr_hl=bn&_x_tr_pto=sc",
                                ],
                                "metrics": [{"values": ["1", "1"]}],
                            },
                            {
                                "dimensions": [
                                    "20220121",
                                    "(entrance)",
                                    "www-sangeethamobiles-com.translate.goog/product-details/redmi-9-prime-space-blue-4gb-ram-128gb-storage/mobmwjrbx569euwr?_x_tr_sl=en&_x_tr_tl=te&_x_tr_hl=te&_x_tr_pto=sc",
                                ],
                                "metrics": [{"values": ["1", "1"]}],
                            },
                            {
                                "dimensions": [
                                    "20220121",
                                    "(entrance)",
                                    "www-sangeethamobiles-com.translate.goog/product-details/vivo-y11-mineral-blue-3gb-ram-32gb-storage/mobq9xs81naany76?_x_tr_sl=en&_x_tr_tl=hi&_x_tr_hl=hi&_x_tr_pto=sc",
                                ],
                                "metrics": [{"values": ["1", "1"]}],
                            },
                            {
                                "dimensions": [
                                    "20220121",
                                    "(entrance)",
                                    "www-sangeethamobiles-com.translate.goog/product-details/vivo-y50-pearl-white-8gb-ram-128gb-storage/mobnyssma65tb6qu?_x_tr_sl=en&_x_tr_tl=hi&_x_tr_hl=hi&_x_tr_pto=sc",
                                ],
                                "metrics": [{"values": ["1", "1"]}],
                            },
                        ],
                    },
                    "nextPageToken": None,
                }
            ]
        }
        self.analytics.reports.return_value.batchGet.return_value.execute.return_value = (
            mock_response
        )

    def test_daily_data(self):
        fetcher = GoogleAnalyticsFetcher(
            self.analytics, 100, "2022-01-21", "2022-01-22"
        )

        data_frame = fetcher.daily_data("mock-view-id")

        assert data_frame.shape == (5, 5)
        assert data_frame.columns.tolist() == [
            "date",
            "previousPage",
            "pagePath",
            "users",
            "pageViews",
        ]
        self.analytics.reports.assert_called_once()
        self.analytics.reports.return_value.batchGet.assert_called_once_with(
            body={
                "reportRequests": [
                    {
                        "viewId": "mock-view-id",
                        "pageSize": 100,
                        "pageToken": "unknown",
                        "dateRanges": [
                            {"startDate": "2022-01-21", "endDate": "2022-01-22"}
                        ],
                        "metrics": [
                            {"expression": "ga:users"},
                            {"expression": "ga:pageViews"},
                        ],
                        "dimensions": [
                            {"name": "ga:date"},
                            {"name": "ga:previousPagePath"},
                            {"name": "ga:pagePath"},
                        ],
                    }
                ]
            }
        )
        self.analytics.reports.return_value.batchGet.return_value.execute.assert_called_once()
