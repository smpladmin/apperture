import json
import logging
from typing import Union
import pandas as pd

from .saver import Saver
from datetime import datetime
from apperture.backend_action import post
from domain.datasource.models import (
    ClickHouseRemoteConnectionCred,
    Credential,
    IntegrationProvider,
)
from store.clickhouse_client_factory import ClickHouseClientFactory


class APIDataSaver(Saver):
    def __init__(
        self,
        credential: Credential,
        app_id: str,
        clickhouse_server_credentials: Union[ClickHouseRemoteConnectionCred, None] = None,
        database_name: str = None,
        use_clickhouse: bool = False,
    ):
        self.tableName = credential.tableName
        self.app_id = app_id
        self.clickhouse_server_credentials = clickhouse_server_credentials
        self.use_clickhouse = use_clickhouse
        self.columns = [
            "create_time",
            "datasourceId",
            "properties",
        ]
        self.database_name = database_name
        self.client = ClickHouseClientFactory.get_client(
                app_id=app_id, clickhouse_server_credentials=clickhouse_server_credentials
            ).connection
        
    def save(self, datasource_id: str, provider: IntegrationProvider, df: pd.DataFrame):
        APIDateField = "Order Date"
        current_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        df = df.fillna("")
        df["json_column"] = df.apply(lambda row: row.to_json(), axis=1)
        df["properties"] = df["json_column"].apply(
            lambda json_str: json.loads(json_str)
        )
        df["properties"] = df["properties"].apply(
            lambda properties: properties
            if APIDateField in properties["data"]
            else {
                **properties,
                "data": {**properties["data"], APIDateField: current_date},
            }
        )

        df["datasourceId"] = datasource_id
        df["create_time"] = df["properties"].apply(
            lambda properties: datetime.strptime(
                properties["data"][APIDateField], "%Y-%m-%d %H:%M:%S"
            )
        )
        df["properties"] = df["properties"].apply(
            lambda properties: {
                **properties,
                "data": {**properties["data"], "refresh_time": current_date},
            }
        )

        df = df[["create_time", "datasourceId", "properties"]]
        start_time = min(df["create_time"])
        end_time = max(df["create_time"])
        
        if self.use_clickhouse:
            try:
                self._save_data_to_clickhouse(df, self.tableName)
                logging.info("Data saved successfully to ClickHouse")
            except Exception as e:
                logging.error(f"Error saving to ClickHouse: {str(e)}")
                raise Exception(f"Failed to save to ClickHouse: {str(e)}")
        else:
            # Save via API if not using ClickHouse
            res = self._save_data(df, self.tableName, start_time, end_time)
            if not res.ok:
                raise Exception(
                    f"Error saving API data for datasource_id {datasource_id}, response status - {res.status_code} - {res.content}"
                )
            
        logging.info("SAVED")

    def _save_data(self, data, tableName, start_time, end_time):
        data = data.to_json(orient="values")
        return post(
            path=f"/private/apidata/{tableName}/{start_time}/{end_time}", data=data
        )

    def _save_data_to_clickhouse(self, data: pd.DataFrame, table_name: str):
        """Save data directly to ClickHouse"""
        data_values = data.values.tolist()
        column_names = data.columns.tolist()
        
        self.client.insert(
            data=data_values,
            table=table_name,
            database=self.database_name,
            column_names=column_names,
        )
