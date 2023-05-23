from unittest.mock import MagicMock, call, ANY

import pandas as pd

from domain.common.models import IntegrationProvider
from store.event_properties_saver import EventPropertiesSaver


class TestEventPropertiesSaver:
    def setup_method(self):
        self.df = pd.DataFrame(
            [
                [{"prop1": "value1", "prop2": "value2"}, "event1"],
                [{"prop3": "value3", "prop2": "value2"}, "event1"],
                [{"prop1": "value1", "prop2": "value2"}, "event2"],
                [{"prop3": "value3", "prop4": "value4"}, "event2"],
                [{"prop1": "value1", "prop2": "value2"}, "event3"],
            ],
            columns=["properties", "eventName"],
        )
        self.service = EventPropertiesSaver()

    def test_find_union(self):
        assert self.service.find_union(items=[[1, 2, 3], [3, 4, 5], [2, 6, 7]]) == [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
        ]

    def test_save(self):
        self.service._save_data = MagicMock()
        self.service.save(
            datasource_id="test-id", df=self.df, provider=IntegrationProvider.MIXPANEL
        )
        self.service._save_data.assert_called_with(
            **{
                "data": {
                    "event": "event3",
                    "properties": ANY,
                    "provider": IntegrationProvider.MIXPANEL,
                },
                "datasource_id": "test-id",
            }
        )
