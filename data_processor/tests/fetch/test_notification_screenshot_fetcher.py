import os
from datetime import datetime
from time import sleep
from unittest.mock import MagicMock, patch

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

from fetch.notification_screenshot_fetcher import NotificationScreenshotFetcher


@patch.dict(
    os.environ,
    {"FRONTEND_BASE_URL": "https://example.com", "FRONTEND_API_KEY": "test_api_key"},
)
@patch("fetch.notification_screenshot_fetcher.datetime")
def test_notification_screenshot_fetcher(datetime_mock):
    fetcher = NotificationScreenshotFetcher()

    fixed_timestamp = datetime(2022, 1, 1, 0, 0, 0)
    datetime_mock.now.return_value = fixed_timestamp
    screenshot_data = b"fake screenshot data"
    webdriver_mock = MagicMock(spec=webdriver.Chrome)
    webdriver_mock.current_url = (
        "https://example.com/private/entity_type/view/id?key=test_api_key"
    )
    webdriver_mock.get_screenshot_as_png.return_value = screenshot_data

    with patch(
        "selenium.webdriver.Chrome", return_value=webdriver_mock
    ) as webdriver_constructor_mock:
        screenshot, filename = fetcher.fetch_screenshot("id", "entity_type")

        webdriver_constructor_mock.assert_called_once()

        webdriver_mock.get.assert_called_once_with(
            "https://example.com/private/entity_type/view/id?key=test_api_key"
        )
        webdriver_mock.get_screenshot_as_png.assert_called_once()

        expected_filename = "entity_type_id_01012022000000.png"
        assert filename == expected_filename
        assert screenshot == screenshot_data
