import os
import logging
from typing import List, Dict
import requests
from apperture.backend_action import get, post
from .models import QueriesSchedule
import pandas as pd
import boto3
import tempfile
import dataframe_image as dfi


class QueriesScheduleService:
    def get_queries_comparison(
        self,
        query_ids: List[str],
        key_columns: List[str],
        compare_columns: Dict[str, str],
    ):
        try:
            logging.info(f"Comparing queries with IDs: {query_ids}")
            response = post(
                path="/private/queries/compare",
                json={
                    "query_ids": query_ids,
                    "key_columns": key_columns,
                    "compare_columns": compare_columns,
                },
            )
            if response.status_code != 200:
                logging.error(f"Error response: {response.json()}")
                raise Exception(f"Error: {response.json()}")
        except Exception as e:
            logging.error(f"Exception occurred: {str(e)}")
            raise Exception(f"Could not compare queries for: {query_ids}") from e
        return response.json()

    def dispatch_alert(self, slack_url: str, payload: dict):
        try:
            print(f"slack url is:{slack_url}")
            response = requests.post(
                slack_url,
                json=payload,
                headers={"Content-Type": "application/json"},
            )

            logging.info(f"SG_1: Payload is: {response}")
            logging.info(f"SG_1: Response: {response.status_code} {response.text}")

            if response.status_code != 200:
                logging.error(
                    f"Failure alert not sent to Slack. Request to Slack returned an error {response.status_code}, the response is:\n{response.text}"
                )
            else:
                logging.info("Alert Dispatched Successfully")

        except requests.exceptions.RequestException as e:
            logging.error(f"Failed to send alert to Slack {slack_url}. Exception: {e}")
        except Exception as e:
            logging.error(f"An unexpected error occurred: {e}")

    def get_queries_schedules(self) -> List[QueriesSchedule]:
        logging.info("{x}: {y}".format(x="get all queries_schedules", y=""))
        response = get(
            "/private/queries/schedules",
        )
        schedules_list = response.json()
        logging.info(f"length of schedules_list: {len(schedules_list)}")

        return [QueriesSchedule(**sl) for sl in schedules_list]

    def create_payload(self, image_url):
        logging.info(f"Image stored at: {image_url}")
        payload = {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "🚨 Alert - Query Comparison Count 🚨",
                        "emoji": True,
                    },
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": ":mega: *Here is the latest comparison table image!* :chart_with_upwards_trend:",
                    },
                },
                {
                    "type": "image",
                    "image_url": image_url,
                    "alt_text": "Queries Comparison table image",
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": "_Generated automatically by the Query Comparison System_",
                        },
                    ],
                },
                {"type": "divider"},
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "📥 Download Report",
                                "emoji": True,
                            },
                            "url": image_url,
                            "action_id": "download_report",
                        },
                    ],
                },
            ],
        }
        return payload

    def create_table_and_save_image_to_s3(self, results, queries_schedule_id: str):
        logging.info("Creating and saving comparison table image")
        df = pd.DataFrame(results["data"])
        styled_df = df.style.set_properties(**{"text-align": "center"})
        styled_df = styled_df.set_table_styles(
            [dict(selector="th", props=[("text-align", "center")])]
        )
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file:
            logging.info(f"df: {styled_df}")
            dfi.export(styled_df, tmp_file.name, table_conversion="matplotlib")
            tmp_file.seek(0)  # Rewind the file

            # Save image to S3
            s3 = boto3.client(
                "s3",
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            )
            filename = f"comparison_table{queries_schedule_id}.png"  # Custom filename
            s3.put_object(Body=tmp_file, Bucket="apperture-assets", Key=filename)
            image_url = f"https://cdn.apperture.io/{filename}"
            logging.info(f"Uploaded to: {image_url} successfully!")

        os.remove(tmp_file.name)

        return image_url
