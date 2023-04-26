import os
from datetime import datetime
import logging
import pyppeteer
from time import sleep


class NotificationScreenshotFetcher:
    async def fetch_screenshot(self, id: str, entityType: str):
        url = f"{os.getenv('FRONTEND_BASE_URL')}/private/{entityType}/view/{id}?key={os.getenv('FRONTEND_API_KEY')}"
        timestamp = datetime.now().strftime("%d%m%Y%H%M%S")
        filename = f"{entityType}_{id}_{timestamp}.png"
        logging.debug(f"Fetching image from  {url}")
        browser = await pyppeteer.connect(
            {"browserWSEndpoint": os.getenv("BROWSERLESS_BASE_URL")}
        )
        page = await browser.newPage()

        await page.goto(url, {"waitUntil": "networkidle0"})
        await page.setViewport({"width": 850, "height": 500})
        try:
            await page.waitForSelector('[data-chart-source-type="G2Plot"]')
            screenshot = await page.screenshot()
            return screenshot, filename
        except:
            logging.info("Chart not rendered")
            return None, None
