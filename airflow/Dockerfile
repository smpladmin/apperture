FROM apache/airflow:2.7.1 as base
COPY requirements.txt /
RUN pip install --no-cache-dir "apache-airflow==2.7.1" -r /requirements.txt

FROM base as tests
COPY . /opt/airflow
RUN pytest /opt/airflow/tests/

FROM base as production
COPY . /opt/airflow
