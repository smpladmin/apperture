import os
from dotenv import load_dotenv

load_dotenv(override=False)

REDIS_HOST = os.getenv("REDIS_HOST")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")
