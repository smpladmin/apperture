import pytest

from airflow.models import DagBag


@pytest.fixture()
def dagbag():
    return DagBag()


def test_dag_loaded(dagbag):
    dag = dagbag.get_dag(dag_id=dagbag.dag_ids[0])
    assert dagbag.import_errors == {}
    assert dag is not None
