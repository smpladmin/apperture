import boto3
import os
import logging


class NotificationScreenshotSaver:
    def save_screenshot_to_s3(self, filename: str, file: bytes) -> str:
        s3 = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )

        s3.put_object(Body=file, Bucket="apperture-assets", Key=filename)
        object_url = f"https://cdn.apperture.io/{filename}"
        logging.info(f"Uploaded to:  {object_url}")
        return object_url
