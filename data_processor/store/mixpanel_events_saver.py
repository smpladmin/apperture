import os
import boto3
from smart_open import open as sopen

from domain.datasource.models import Credential, DataSource


class S3EventsSaver:
    def __init__(self, credential: Credential, date: str):
        self.session = boto3.Session(
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        s3_file_name = f"{credential.account_id}/{date.replace('-', '/')}/fullday/data"
        self.s3_url = f"s3://{os.getenv('S3_BUCKET_NAME')}/{s3_file_name}"

    def open(self):
        return sopen(
            self.s3_url,
            "wb",
            transport_params={"client": self.session.client("s3")},
        )
