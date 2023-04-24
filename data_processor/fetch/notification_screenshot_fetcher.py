import os
from datetime import datetime
import logging
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from time import sleep


class NotificationScreenshotFetcher:
    def fetch_screenshot(self, id: str, entityType: str):
        url = (
            os.getenv("FRONTEND_BASE_URL")
            + f"/private/{entityType}/view/{id}?key={os.getenv('FRONTEND_API_KEY')}"
        )
        redirect_url = os.getenv("FRONTEND_BASE_URL") + "/404"

        timestamp = datetime.now().strftime("%d%m%Y%H%M%S")
        filename = f"{entityType}_{id}_{timestamp}.png"

        options = Options()
        options.add_argument("--headless")
        options.add_argument("window-size=850,500")

        driver = webdriver.Chrome(options=options)
        logging.info("Fetching image from ", url)
        driver.get(url)
        sleep(5)

        if driver.current_url == redirect_url:
            return None, None
        else:
            return driver.get_screenshot_as_png(), filename
