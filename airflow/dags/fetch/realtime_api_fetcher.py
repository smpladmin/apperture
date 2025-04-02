import requests
import logging
import json
from datetime import datetime
from domain.datasource.models import Credential, ClickHouseRemoteConnectionCred
from store.clickhouse_client_factory import ClickHouseClientFactory

class RealtimeAPIFetcher:
    def __init__(self, credential: Credential, app_id: str, clickhouse_server_credentials: ClickHouseRemoteConnectionCred, database_name: str):
        self.end_point = credential.account_id
        self.headers = json.loads(credential.api_key)
        self.table_name = credential.tableName
        self.database_name = database_name
        self.client = ClickHouseClientFactory.get_client(
            app_id=app_id,
            clickhouse_server_credentials=clickhouse_server_credentials
        ).connection

    def get_last_entry_timestamp(self):
        query = f"""
        SELECT MAX(create_time) as last_timestamp 
        FROM {self.database_name}.{self.table_name}
        """
        
        result = self.client.query(query)
        last_timestamp = result.result_set[0][0] if result and result.result_set else None
        logging.info(f"Last timestamp: {last_timestamp}")
        
        if not last_timestamp:
            # If no entries exist, use a default start time (e.g., 1 hour ago)
            last_timestamp = datetime.now().timestamp() - 3600
            
        return datetime.fromtimestamp(last_timestamp)

    def fetch(self):
        start_time = self.get_last_entry_timestamp().strftime("%Y-%m-%d %H:%M:%S")
        end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        data_url = f"{self.end_point}?start_time={start_time}&end_time={end_time}"
        logging.info(f"Fetching data from {data_url}")
        
        response = requests.get(data_url, headers=self.headers)
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            error_msg = f"API request failed with status code {response.status_code}: {response.text}"
            logging.error(error_msg)
            raise Exception(error_msg) 
