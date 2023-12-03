import logging
import pendulum
from typing import Dict, Union
from datetime import timedelta, datetime
from utils.utils import AIRFLOW_INIT_DATE
from airflow.decorators import dag, task


from domain.datamart.models import Datamart
from domain.datasource.service import DataSourceService
from domain.datamart.service import DatamartService


datasource_service = DataSourceService()
datamart_service = DatamartService()


@task
def refresh_datamart_table(datamart_id: str):
    datamart_service.refresh_datamart(datamart_id)


def create_dag(datamart: Datamart, created_date: datetime):
    @dag(
        dag_id=f"datamart_data_loader_{datamart.tableName}_{datamart.id}",
        description=f"Datamart datasource daily refresh for {datamart.tableName}_{datamart.id}",
        schedule="0 7 * * *",  # to be picked according to datamart fetch frequency
        start_date=pendulum.instance(
            created_date if created_date > AIRFLOW_INIT_DATE else AIRFLOW_INIT_DATE,
            tz=pendulum.timezone("Asia/Kolkata"),
        ),
        tags=["datamart-scheduled-data-fetch"],
    )
    def datamart_loader(datamart_id: str):
        refresh_datamart_table(datamart_id=datamart_id)

    datamart_loader(datamart_id=datamart.id)


datamarts = datamart_service.get_datamarts()

for datamart in datamarts:
    create_dag(
        datamart=datamart,
        created_date=datamart.createdAt,
    )
