import logging
import os
import requests
import time
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Set up the logging
logging.basicConfig(level=logging.INFO)

# Slack endpoint
SLACK_ENDPOINT = os.getenv("SLACK_ENDPOINT")

# Set up the Swarmpit API endpoint
SWARMPIT_ENDPOINT = os.getenv("SWARMPIT_ENDPOINT")
SWARMPIT_API_ENDPOINT = f"{SWARMPIT_ENDPOINT}/api"
SWARMPIT_AUTH_TOKEN = os.getenv("SWARMPIT_AUTH_TOKEN")

# Alert manager config
ALERT_MUTE_ITERATIONS = int(os.getenv("ALERT_MUTE_ITERATIONS", "5"))
ITERATION_SECONDS = int(os.getenv("ITERATION_SECONDS", "120"))
CPU_THRESHOLD = float(os.getenv("CPU_THRESHOLD", "60"))
MEMORY_THRESHOLD = float(os.getenv("MEMORY_THRESHOLD", "60"))
ENV = os.getenv("ENV", "LOCAL")

# Set up the initial alert status dictionary
alert_status = {}


# Define a function to get the running tasks from Swarmpit
def get_running_tasks():
    try:
        # Make the API call to get all tasks
        tasks = requests.get(
            f"{SWARMPIT_API_ENDPOINT}/tasks",
            headers={"Authorization": SWARMPIT_AUTH_TOKEN},
        ).json()
        logging.info(f"Got {len(tasks)} tasks from Swarmpit.")

        # Get the running tasks with high CPU or memory utilization
        running_tasks = [
            task
            for task in tasks
            if task["state"] == "running"
            and task["stats"]
            and (
                task["stats"]["cpuPercentage"] > CPU_THRESHOLD
                or task["stats"]["memoryPercentage"] > MEMORY_THRESHOLD
            )
        ]

        # Check if any of the running tasks have already been flagged for high utilization
        for task in running_tasks:
            if task["id"] in alert_status:
                alert_status[task["id"]]["count"] += 1
            else:
                alert_status[task["id"]] = {"status": "alert", "count": 1}

        # Check if any previously flagged tasks have low utilization now
        task_ids = list(alert_status.keys())
        for task_id in task_ids:
            if task_id not in [task["id"] for task in running_tasks]:
                alert_status.pop(task_id, None)
            elif (
                alert_status[task_id]["count"] == 1
                or alert_status[task_id]["count"] % ALERT_MUTE_ITERATIONS == 0
            ):
                alert_status[task_id]["status"] = "alert"
            else:
                alert_status[task_id]["status"] = "wait"

        # Return the running tasks with high CPU or memory utilization
        return running_tasks

    except requests.exceptions.RequestException as e:
        logging.error(f"Error getting running tasks from Swarmpit: {e}")
        return []


def build_message(task):
    return f"Task <{SWARMPIT_ENDPOINT}/#/services/{task['serviceName']}|{task['taskName']}> has high CPU or Memory utilization ({task['stats']['cpuPercentage']:.4f}% CPU, {task['stats']['memoryPercentage']:.4f}% memory)."


# Define a function to send a Slack alert for a given task
def send_slack_alert(tasks):
    task_messages = "\n".join([build_message(task) for task in tasks])
    message = f":rotating_light: *ENV: {ENV}* \n{task_messages}"
    logging.info(f"Sending Slack alert: {message}")

    try:
        requests.post(
            SLACK_ENDPOINT,
            json={"text": message},
            headers={"Content-type": "application/json"},
        )
    except requests.exceptions.RequestException as e:
        logging.error(f"Error sending Slack alert: {e}")


# Loop indefinitely, calling the Swarmpit API every ITERATION_SECONDS seconds
while True:
    logging.info("Getting running tasks from Swarmpit...")
    running_tasks = get_running_tasks()

    # Send Slack alerts for any running tasks with high CPU or memory utilization
    alert_tasks = [
        task for task in running_tasks if alert_status[task["id"]]["status"] == "alert"
    ]
    if alert_tasks:
        send_slack_alert(alert_tasks)
    else:
        logging.info("No alerts")

    logging.info(f"Sleeping for {ITERATION_SECONDS} seconds...")

    # Wait for n seconds before making the next API call
    time.sleep(ITERATION_SECONDS)
