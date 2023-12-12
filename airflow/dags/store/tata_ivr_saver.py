import logging
from typing import Union
from domain.datasource.models import ClickHouseRemoteConnectionCred, TataIvrEvents
from store.clickhouse_client_factory import ClickHouseClientFactory
import json


class TataIVRDataSaver:
    def __init__(
        self,
        app_id,
        clickhouse_server_credentials: Union[ClickHouseRemoteConnectionCred, None],
    ):
        self.app_id = app_id
        self.client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credentials
        ).connection
        self.columns = [
            "id",
            "timestamp",
            "datasource_id",
            "call_id",
            "uuid",
            "date",
            "time",
            "end_stamp",
            "missed_agents",
            "status",
            "direction",
            "call_duration",
            "answered_seconds",
            "minutes_consumed",
            "broadcast_id",
            "dtmf_input",
            "client_number",
            "hangup_cause",
            "did_number",
            "contact_details",
            "recording_url",
            "service",
            "properties",
        ]

    def save(self, event_data):
        event_data = event_data[self.columns]
        data = event_data.values.tolist()
        logging.info(f"SAVING {len(data)} entries ")
        logging.info(f"Columns : {self.columns}")

        self.client.insert(
            data=data,
            table="tata_ivr_events",
            column_names=self.columns,
        )
        logging.info(f"EVENTS saved successfully!")
