from typing import Dict

import pendulum

from airflow import DAG
from textwrap import dedent

from airflow.operators.python import PythonOperator

from store.api_data_saver import APIDataSaver
from fetch.api_data_fetcher import APIDataFetcher
from domain.datasource.service import DataSourceService
from domain.datasource.models import IntegrationProvider
from event_processors.api_data_processor import APIDataProcessor

datasource_service = DataSourceService()


def create_dag(datasource_id: str, default_args: Dict) -> DAG:
    with DAG(
        f"api_data_loader_{datasource_id}",
        default_args=default_args,
        description=f"API datasource daily refresh for {datasource_id}",
        schedule="0 7 * * *",
        start_date=pendulum.datetime(
            2023, 10, 10, tz=pendulum.timezone("Asia/Kolkata")
        ),
        catchup=False,
        tags=["daily-data-fetch"],
    ) as dag:
        dag.doc_md = __doc__

        def get_datasource(**kwargs):
            ti = kwargs["ti"]
            datasource = datasource_service.get_datasource_with_credential(
                id=datasource_id
            )
            ti.xcom_push("datasource", datasource)

        def fetch(**kwargs):
            ti = kwargs["ti"]
            datasource = ti.xcom_pull(task_ids="get_datasource", key="datasource")
            api_data = APIDataFetcher(
                credential=datasource.credential,
                date=pendulum.today().subtract(days=1).format("YYYY-MM-DD"),
            ).fetch()
            ti.xcom_push("api_data", api_data)

        def process(**kwargs):
            ti = kwargs["ti"]
            api_data = ti.xcom_pull(task_ids="fetch", key="api_data")
            processed_api_data = APIDataProcessor().process(events_data=api_data)
            ti.xcom_push("processed_api_data", processed_api_data)

        def save(**kwargs):
            ti = kwargs["ti"]
            datasource = ti.xcom_pull(task_ids="get_datasource", key="datasource")
            processed_api_data = ti.xcom_pull(
                task_ids="process", key="processed_api_data"
            )
            APIDataSaver(credential=datasource.credential).save(
                datasource_id=datasource.datasource.id,
                provider=IntegrationProvider.API,
                df=processed_api_data,
            )

        get_datasource_task = PythonOperator(
            task_id="get_datasource",
            python_callable=get_datasource,
        )
        get_datasource_task.doc_md = dedent(
            """\
        #### Get Datasource task
        Gets datasource object for a provided datasource id.
        """
        )

        fetch_task = PythonOperator(
            task_id="fetch",
            python_callable=fetch,
        )
        fetch_task.doc_md = dedent(
            """\
        #### Fetch task
        Fetches data from API.
        """
        )

        process_task = PythonOperator(
            task_id="process",
            python_callable=process,
        )
        process_task.doc_md = dedent(
            """\
        #### Process task
        Processes fetched data and converts it into a dataframe.
        """
        )

        save_task = PythonOperator(
            task_id="save",
            python_callable=save,
        )
        save_task.doc_md = dedent(
            """\
        #### Save task
        Saves the processed data to the database.
        """
        )

        get_datasource_task >> fetch_task >> process_task >> save_task

    return dag


default_args = {}
datasources = datasource_service.get_datasource_ids_for_provider(
    provider=IntegrationProvider.API
)

for datasource_id in datasources:
    globals()[f"dag_{datasource_id}"] = create_dag(datasource_id, default_args)
