from unittest.mock import ANY
from beanie import PydanticObjectId

from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSourceVersion
from domain.edge.models import TrendType


def test_get_node_significance(client_init, edge_service, node_significance_response):
    response = client_init.get(
        "/datasources/637739d383ea7fda83e72a2d/node_significance?node='Login'&end_date=2022-11-24"
    )
    assert response.status_code == 200
    assert response.json() == node_significance_response

    edge_service.get_node_significance.assert_called_once()
    kwargs = edge_service.get_node_significance.call_args.kwargs
    assert {
        "app_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "created_at": ANY,
        "external_source_id": "123",
        "id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "integration_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "name": None,
        "provider": IntegrationProvider.MIXPANEL,
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "version": DataSourceVersion.DEFAULT,
    } == kwargs["datasource"].dict()

    kwargs.pop("datasource")
    assert {
        "end_date": "2022-11-24",
        "node": "'Login'",
        "start_date": "1970-01-01",
    } == kwargs


def test_get_node_trends(client_init, edge_service, node_trends_response):
    response = client_init.get(
        "/datasources/637739d383ea7fda83e72a2d/trends?node='Login'&end_date=2022-11-24&trend_type=week"
    )
    assert response.status_code == 200
    assert response.json() == node_trends_response
    edge_service.get_node_trends.assert_called_once()
    kwargs = edge_service.get_node_trends.call_args.kwargs
    assert {
        "app_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "created_at": ANY,
        "external_source_id": "123",
        "id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "integration_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "name": None,
        "provider": IntegrationProvider.MIXPANEL,
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "version": DataSourceVersion.DEFAULT,
    } == kwargs["datasource"].dict()

    kwargs.pop("datasource")
    assert {
        "end_date": "2022-11-24",
        "node": "'Login'",
        "start_date": "1970-01-01",
        "is_entrance_node": False,
        "trend_type": TrendType.WEEK,
    } == kwargs


def test_get_sankey_nodes(client_init, edge_service, node_sankey_response):
    response = client_init.get(
        "/datasources/637739d383ea7fda83e72a2d/sankey?node='Login'&end_date=2022-11-24"
    )
    assert response.status_code == 200
    assert response.json() == node_sankey_response
    edge_service.get_node_sankey.assert_called_once()
    kwargs = edge_service.get_node_sankey.call_args.kwargs
    assert {
        "app_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "created_at": ANY,
        "external_source_id": "123",
        "id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "integration_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "name": None,
        "provider": IntegrationProvider.MIXPANEL,
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "version": DataSourceVersion.DEFAULT,
    } == kwargs["datasource"].dict()

    kwargs.pop("datasource")
    assert {
        "end_date": "2022-11-24",
        "node": "'Login'",
        "start_date": "1970-01-01",
    } == kwargs
