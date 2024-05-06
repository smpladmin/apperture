import logging
import requests

CDC_INTERNAL_ALERTS_URL = (
    "https://hooks.slack.com/services/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"
)
WIOM_CDC_ALERTS_URL = (
    "https://hooks.slack.com/services/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"
)
WARNING_ALERTS_URL = (
    "https://hooks.slack.com/services/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"
)
AIRFLOW_ALERTS_URL = (
    "https://hooks.slack.com/services/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"
)

# Configurable slack channel for each dag
DAGS_SLACK_URLS = {
    "test_slack_alerts_example_dag": [AIRFLOW_ALERTS_URL],
    "clickstream-data-backup": [AIRFLOW_ALERTS_URL],
    "clickstream-delete-backup": [AIRFLOW_ALERTS_URL],
}


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
        for webhook_url in DAGS_SLACK_URLS.get(dag_id, [AIRFLOW_ALERTS_URL]):
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
