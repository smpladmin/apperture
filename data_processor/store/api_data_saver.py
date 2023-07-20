import logging
import os
import numpy as np
import pandas as pd
import requests
from apperture.backend_action import post
from domain.datasource.models import Credential
from domain.common.models import IntegrationProvider
from .saver import Saver
import json
from datetime import datetime


class APIDataSaver(Saver):
    def __init__(self, credential: Credential):
        self.tableName = credential.tableName

    def save(self, datasource_id: str, provider: IntegrationProvider, df: pd.DataFrame):
        df = df.fillna("")
        df['json_column'] = df.apply(lambda row: row.to_json(), axis=1)
        df['properties'] = df['json_column'].apply(lambda json_str: json.loads(json_str))
        df["datasourceId"] = datasource_id
        df['create_time']= datetime.strptime(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "%Y-%m-%d %H:%M:%S")
        df=df[['create_time','datasourceId','properties']]
        res = self._save_data(df,self.tableName)
        if not res.ok:
            raise Exception(
                f"Error saving API data for datasource_id {datasource_id}, response status - {res.status_code} - {res.content}"
            )
        logging.info("SAVED")

    def _save_data(self, data,tableName):
        data = data.to_json(orient="values")
        return requests.post(
            f"{os.getenv('BACKEND_BASE_URL')}/private/apidata/{tableName}",
            headers={
                f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv(
                    "BACKEND_API_KEY_SECRET"
                )
            },
            data=data,
        )
