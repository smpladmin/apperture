import os
import datetime
import logging
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from time import sleep
from typing import Union, String


def fetch_screenshot(id: String, entityType: String) -> Union((String, bytes), None):

    url = os.getenv('FRONTEND_BASE_URL') + \
        f"/private/{entityType}/view/{id}?key={os.getenv('FRONTEND_API_KEY')}"
    redirect_url = os.getenv('FRONTEND_BASE_URL')+"/404"

    filename = entityType+'_'+id+"_" + \
        datetime.datetime.now().strftime("%d%m%Y%H%M%S")+'.png'

    options = Options()
    options.add_argument("--headless")
    options.add_argument("window-size=850,500")

    driver = webdriver.Chrome(options=options)
    logging.info("Fetching image from ", url)
    driver.get(url)
    sleep(5)

    if driver.current_url == redirect_url:
        return
    else:
        return driver.get_screenshot_as_png(), filename
