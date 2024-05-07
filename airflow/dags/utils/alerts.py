import os
import logging
import requests
from dotenv import load_dotenv

# Load .env
load_dotenv()

CDC_INTERNAL_ALERTS_URL = os.getenv("SLACK_URL_CDC_INTERNAL_ALERTS")
WIOM_CDC_ALERTS_URL = os.getenv("SLACK_URL_WIOM_CDC_ALERTS")
WARNING_ALERTS_URL = os.getenv("SLACK_URL_WARNING_ALERTS")
AIRFLOW_ALERTS_URL = os.getenv("SLACK_URL_AIRFLOW_ALERTS")

# Configurable slack channel for each dag
DAGS_SLACK_URLS = {
    "test_slack_alerts_example_dag": [AIRFLOW_ALERTS_URL],
    "clickstream-data-backup": [AIRFLOW_ALERTS_URL],
    "clickstream-delete-backup": [AIRFLOW_ALERTS_URL],
}
# Default slack urls
DEFAULT_SLACK_URLS = [AIRFLOW_ALERTS_URL]


def send_failure_alert_to_slack(context):
    try:
        # Extracting details
        dag_id = context["task_instance"].dag_id
        task_id = context["task_instance"].task_id
        error = context.get("exception", "No exception message available.")

        # Creating slack message
        slack_msg = {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"Airflow Alert - {dag_id} :zap:",
                        "emoji": True,
                    },
                },
                {
                    "type": "section",
                    "text": {
                        "type": "plain_text",
                        "text": f"Task Failed: {task_id}\nException: {error}",
                    },
                },
            ]
        }

        # Note: If list of urls is not available in DAGS_SLACK_URLS then by default sending the messages to AIRFLOW_ALERTS_URL.
        for webhook_url in DAGS_SLACK_URLS.get(dag_id, DEFAULT_SLACK_URLS):
            response = requests.post(
                webhook_url,
                json=slack_msg,
                headers={
                    "Content-Type": "application/json",
                },
            )
            if response.status_code != 200:
                logging.error(
                    f"Failure alert not sent to slack. Request to Slack returned an error {response.status_code}, the response is:\n{response.text}"
                )

    except Exception:
        logging.exception(f"Error occured. Failed to send Failure alert to slack")
