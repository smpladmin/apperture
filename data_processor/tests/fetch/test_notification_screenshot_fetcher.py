import asyncio
import os
from datetime import datetime
from time import sleep
from unittest.mock import AsyncMock, MagicMock, patch

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

from fetch.notification_screenshot_fetcher import NotificationScreenshotFetcher


@patch.dict(
    os.environ,
    {
        "FRONTEND_BASE_URL": "https://example.com",
        "FRONTEND_API_KEY": "test_api_key",
        "BROWSERLESS_BASE_URL": "ws://chrome:3000",
    },
)
@patch("fetch.notification_screenshot_fetcher.datetime")
def test_notification_screenshot_fetcher(datetime_mock):
    fetcher = NotificationScreenshotFetcher()

    fixed_timestamp = datetime(2022, 1, 1, 0, 0, 0)
    datetime_mock.now.return_value = fixed_timestamp
    screenshot_data = b"fake screenshot data"
    pyppeteer_mock = MagicMock()
    pyppeteer_mock.connect = AsyncMock()
    pyppeteer_mock.newPage = AsyncMock()
    pyppeteer_mock.newPage.goto = AsyncMock()
    pyppeteer_mock.newPage.setViewport = AsyncMock()
    pyppeteer_mock.newPage.waitForSelector = AsyncMock()
    pyppeteer_mock.newPage.screenshot = AsyncMock(return_value=screenshot_data)

    with patch("pyppeteer.connect", return_value=pyppeteer_mock):
        screenshot, filename = asyncio.get_event_loop().run_until_complete(
            fetcher.fetch_screenshot("id", "entity_type")
        )

        expected_filename = "entity_type_id_01012022000000.png"
        assert filename == expected_filename
