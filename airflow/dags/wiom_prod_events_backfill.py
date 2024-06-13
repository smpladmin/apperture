import pendulum
import json

from airflow.models import Param, Variable
from typing import Dict, Union, List
from datetime import timedelta, datetime
from airflow.decorators import task, dag

from domain.datasource.service import DataSourceService
from store.facebook_ads_saver import FacebookAdsDataSaver

from event_processors import ch_mssql_data_processor


from utils.utils import (
    FACEBOOK_ADS_DATA_FETCH_DAYS_OFFSET,
)
from utils.alerts import send_failure_alert_to_slack
from domain.datasource.models import (
    AppDatabaseResponse,
    IntegrationProvider,
    Credential,
    DataSource,
    ClickHouseRemoteConnectionCred,
)
import pandas as pd


datasource_service = DataSourceService()
provider = IntegrationProvider.FACEBOOK_ADS


@task
def get_datasource_and_credential(
    datasource_id: str,
) -> Dict[str, Union[DataSource, Credential]]:
    datasource = datasource_service.get_datasource_with_credential(id=datasource_id)
    return {"datasource": datasource.datasource, "credential": datasource.credential}


@task
def get_clickhouse_server_credential(
    datasource: DataSource,
) -> Union[ClickHouseRemoteConnectionCred, None]:
    return datasource_service.get_clickhouse_server_credentials_for_app(
        app_id=datasource.appId
    )


@task
def get_app_database(
    datasource: DataSource,
) -> AppDatabaseResponse:
    return datasource_service.get_database_for_app(app_id=datasource.appId)


@task
def create_and_process_dataframe():
    df = ch_mssql_data_processor.process_data()
    return df


@task
def save_datatframe(
    df: pd.DataFrame,
    datasource: DataSource,
    clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
    database_details: AppDatabaseResponse,
):

    saver = FacebookAdsDataSaver(
        app_id=datasource.appId,
        clickhouse_server_credentials=clickhouse_server_credential,
    )

    saver.save(
        event_data=df,
        table_name="prod_events",
        database_name=database_details.database_credentials.databasename,
    )


def create_dag(datasource_id: str):

    @dag(
        dag_id=f"migration_{datasource_id}",
        description=f"migration for {datasource_id}",
        schedule="30 1 * * *",
        start_date=pendulum.instance(
            datetime.now() - timedelta(days=FACEBOOK_ADS_DATA_FETCH_DAYS_OFFSET),
            tz=pendulum.timezone("Asia/Kolkata"),
        ),
        catchup=False,
        tags=[f"migration"],
        default_args={
            "on_failure_callback": [send_failure_alert_to_slack],
        },
        is_paused_upon_creation=True,
    )
    def facebook_ads_data_loader():
        datasource_with_credential = get_datasource_and_credential(
            datasource_id=datasource_id
        )
        datasource = datasource_with_credential["datasource"]
        credential = datasource_with_credential["credential"]
        clickhouse_server_credential = get_clickhouse_server_credential(
            datasource=datasource
        )
        app_database_details = get_app_database(datasource=datasource)
        df = create_and_process_dataframe()
        save_datatframe(
            df=df,
            datasource=datasource,
            clickhouse_server_credential=clickhouse_server_credential,
            database_details=app_database_details,
        )

    facebook_ads_data_loader()


# This was used for migrating data for wiom prod events from booking_logs and tasklogs
# Any migration ahead of similar type can be refered from this

datasource_id = "65b1f642f3213a617bbedf8f"

create_dag(datasource_id=datasource_id)
