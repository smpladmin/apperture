import boto3
import os
import logging


class NotificationScreenshotSaver:
    def save_screenshot_to_s3(filename: str, file: bytes) -> str:
        s3 = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("BACKEND_BASE_URL"),
            aws_secret_access_key=os.getenv("BACKEND_BASE_URL"),
        )

        s3.put_object(
            Body=file, Bucket=os.getenv("APPERTURE_ASSET_BUCKET"), Key=filename
        )
        object_url = f"https://cdn.apperture.io/{filename}"
        logging.info("Uploaded to: ", object_url)
        return object_url
