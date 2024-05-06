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
SLACK_ENDPOINT_CDC_INTERNAL_ALERTS = os.getenv("SLACK_ENDPOINT_CDC_INTERNAL_ALERTS")
SLACK_ENDPOINT_WIOM_CDC_ALERTS = os.getenv("SLACK_ENDPOINT_WIOM_CDC_ALERTS")

# Set up the Swarmpit API endpoint
SWARMPIT_ENDPOINT = os.getenv("SWARMPIT_ENDPOINT")
SWARMPIT_API_ENDPOINT = f"{SWARMPIT_ENDPOINT}/api"
SWARMPIT_AUTH_TOKEN = os.getenv("SWARMPIT_AUTH_TOKEN")

# Alert manager config
ALERT_MUTE_ITERATIONS = int(os.getenv("ALERT_MUTE_ITERATIONS", "5"))
ITERATION_SECONDS = int(os.getenv("ITERATION_SECONDS", "120"))
CPU_THRESHOLD = float(os.getenv("CPU_THRESHOLD", "60"))
MEMORY_THRESHOLD = float(os.getenv("MEMORY_THRESHOLD", "60"))
DISK_THRESHOLD = float(os.getenv("DISK_THRESHOLD", "60"))
ENV = os.getenv("ENV", "LOCAL")

# Set up the initial alert status dictionary
alert_status = {}
node_alert_status = {}


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


# Define a function to get nodes from Swarmpit
def get_active_nodes():
    try:
        # Make the API call to get all nodes
        nodes = requests.get(
            f"{SWARMPIT_API_ENDPOINT}/nodes",
            headers={"Authorization": SWARMPIT_AUTH_TOKEN},
        ).json()
        logging.info(f"Got {len(nodes)} nodes from Swarmpit.")

        # Get the running nodes with high CPU or memory utilization
        active_nodes = [
            node
            for node in nodes
            if node["state"] == "ready"
            and node["stats"]
            and (
                node["stats"]["cpu"]["usedPercentage"] > CPU_THRESHOLD
                or node["stats"]["memory"]["usedPercentage"] > MEMORY_THRESHOLD
                or node["stats"]["disk"]["usedPercentage"] > DISK_THRESHOLD
            )
        ]

        # Check if any of the running tasks have already been flagged for high utilization
        for node in active_nodes:
            if node["id"] in node_alert_status:
                node_alert_status[node["id"]]["count"] += 1
            else:
                node_alert_status[node["id"]] = {"status": "alert", "count": 1}

        # Check if any previously flagged tasks have low utilization now
        node_ids = list(node_alert_status.keys())
        for node_id in node_ids:
            if node_id not in [node["id"] for node in active_nodes]:
                node_alert_status.pop(node_id, None)
            elif (
                node_alert_status[node_id]["count"] == 1
                or node_alert_status[node_id]["count"] % ALERT_MUTE_ITERATIONS == 0
            ):
                node_alert_status[node_id]["status"] = "alert"
            else:
                node_alert_status[node_id]["status"] = "wait"

        # Return the running tasks with high CPU or memory utilization
        return active_nodes

    except requests.exceptions.RequestException as e:
        logging.error(f"Error getting running nodes from Swarmpit: {e}")
        return []


def get_services() -> dict:
    try:
        # Make the API call to get all services
        services = requests.get(
            f"{SWARMPIT_API_ENDPOINT}/services",
            headers={"Authorization": SWARMPIT_AUTH_TOKEN},
        ).json()
        logging.info(f"Got {len(services)} services from Swarmpit.")
        services_map = {service["serviceName"]: service for service in services}

        return services_map

    except requests.exceptions.RequestException as e:
        logging.error(f"Error gettin services from Swarmpit: {e}")
        return {}


def build_message_for_task(task):
    return f"Task <{SWARMPIT_ENDPOINT}/#/services/{task['serviceName']}|{task['taskName']}> has high CPU or Memory utilization ({task['stats']['cpuPercentage']:.4f}% CPU, {task['stats']['memoryPercentage']:.4f}% memory)."


def build_message_for_node(node):
    return f"Node <{SWARMPIT_ENDPOINT}/#/nodes/{node['nodeName']}> has high CPU | Memory | Disk utilization ({node['stats']['cpu']['usedPercentage']:.4f}% CPU, {node['stats']['memory']['usedPercentage']:.4f}% memory, {node['stats']['disk']['usedPercentage']:.4f}% disk)."


# Function to send a Slack alert message
def send_slack_message(url, message):
    try:
        requests.post(
            url,
            json={"text": message},
            headers={"Content-type": "application/json"},
        )
    except requests.exceptions.RequestException as e:
        logging.error(f"Error sending Slack alert: {e}")


# Define a function to send a Slack alert for a given task
def send_slack_alert(tasks=None, nodes=None):
    if tasks:
        messages = "\n".join([build_message_for_task(task) for task in tasks])
    else:
        messages = "\n".join([build_message_for_node(node) for node in nodes])
    message = f":rotating_light: *ENV: {ENV}* \n{messages}"
    logging.info(f"Sending Slack alert: {message}")

    send_slack_message(SLACK_ENDPOINT, message)


# Loop indefinitely, calling the Swarmpit API every ITERATION_SECONDS seconds
while True:
    logging.info("Getting running tasks from Swarmpit...")
    running_tasks = get_running_tasks()
    active_nodes = get_active_nodes()
    services = get_services()

    # Send Slack alerts for any running tasks with high CPU or memory utilization
    alert_tasks = [
        task for task in running_tasks if alert_status[task["id"]]["status"] == "alert"
    ]
    if alert_tasks:
        send_slack_alert(tasks=alert_tasks)
    else:
        logging.info("No task alerts")

    alert_nodes = [
        node
        for node in active_nodes
        if node_alert_status[node["id"]]["status"] == "alert"
    ]
    if alert_nodes:
        send_slack_alert(nodes=alert_nodes)
    else:
        logging.info("No node alerts")

    # Checking if cdc_connect service is running
    cdc_connect = services.get("cdc_connect")
    if cdc_connect is None or cdc_connect["status"]["tasks"].get("running", 0) < 1:
        for url in [SLACK_ENDPOINT_CDC_INTERNAL_ALERTS, SLACK_ENDPOINT_WIOM_CDC_ALERTS]:
            send_slack_message(
                url, f"*Alert - cdc_connect*\n\nCDC producer service may be down"
            )

    logging.info(f"Sleeping for {ITERATION_SECONDS} seconds...")

    # Wait for n seconds before making the next API call
    time.sleep(ITERATION_SECONDS)
