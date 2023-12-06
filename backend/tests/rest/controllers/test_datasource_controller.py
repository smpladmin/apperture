from unittest.mock import ANY

from beanie import PydanticObjectId

from domain.common.models import CaptureEvent, IntegrationProvider
from domain.datasources.models import DataSource, DataSourceVersion
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
        "provider": IntegrationProvider.APPERTURE,
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "version": DataSourceVersion.DEFAULT,
        "enabled": True,
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
        "provider": IntegrationProvider.APPERTURE,
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "version": DataSourceVersion.DEFAULT,
        "enabled": True,
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
        "provider": IntegrationProvider.APPERTURE,
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "version": DataSourceVersion.DEFAULT,
        "enabled": True,
    } == kwargs["datasource"].dict()

    kwargs.pop("datasource")
    assert {
        "end_date": "2022-11-24",
        "node": "'Login'",
        "start_date": "1970-01-01",
    } == kwargs


def test_get_event_property_values(client_init, events_service):
    response = client_init.get(
        "/datasources/637739d383ea7fda83e72a2d/property_values?event_property=country&end_date=2022-01-01"
    )
    assert response.status_code == 200
    assert response.json() == [["Philippines"], ["Hong Kong"]]
    events_service.get_values_for_property.assert_called_once_with(
        **{
            "datasource_id": "637739d383ea7fda83e72a2d",
            "end_date": "2022-01-01",
            "event_property": "country",
            "start_date": "1970-01-01",
        }
    )


def test_get_event_properties(client_init, properties_service):
    response = client_init.get("/datasources/637739d383ea7fda83e72a2d/event_properties")
    assert response.status_code == 200
    assert response.json() == ["prop1", "prop2"]
    properties_service.fetch_properties.assert_called_once_with(
        **{"ds_id": "637739d383ea7fda83e72a2d"}
    )


def test_get_events_for_demo_table(client_init, events_service):
    response = client_init.get(
        "/datasources/637739d383ea7fda83e72a2d/events?is_aux=False&table_name=All"
    )
    assert response.status_code == 200
    assert response.json() == {
        "count": 2,
        "pageNumber": 0,
        "data": [
            {
                "name": "Content_Like",
                "city": "Delhi",
                "timestamp": "2023-01-13T15:23:38",
                "user_id": "mthdas8@gmail.com",
            },
            {
                "name": "WebView_Open",
                "city": "Delhi",
                "timestamp": "2023-01-13T15:23:41",
                "user_id": "mthdas8@gmail.com",
            },
        ],
    }

    events_service.get_events.assert_called_once_with(
        **{
            "datasource_id": "637739d383ea7fda83e72a2d",
            "app_id": "636a1c61d715ca6baae65611",
            "is_aux": False,
            "table_name": "All",
            "page_number": 0,
            "page_size": 100,
            "user_id": None,
        }
    )


def test_get_events_for_user_id(client_init, events_service):
    response = client_init.get(
        "/datasources/637739d383ea7fda83e72a2d/events?user_id=123&page_number=0"
    )
    assert response.status_code == 200
    assert response.json() == {
        "count": 2,
        "pageNumber": 0,
        "data": [
            {
                "name": "Content_Like",
                "city": "Delhi",
                "timestamp": "2023-01-13T15:23:38",
                "user_id": "mthdas8@gmail.com",
            },
            {
                "name": "WebView_Open",
                "city": "Delhi",
                "timestamp": "2023-01-13T15:23:41",
                "user_id": "mthdas8@gmail.com",
            },
        ],
    }

    events_service.get_events.assert_called_with(
        **{
            "datasource_id": "637739d383ea7fda83e72a2d",
            "app_id": "636a1c61d715ca6baae65611",
            "is_aux": False,
            "page_number": 0,
            "page_size": 100,
            "table_name": "events",
            "user_id": "123",
        }
    )


def test_get_nodes(
    client_init,
    events_service,
    event_properties_service,
    datasource_service,
    action_service,
    clickstream_event_properties_service,
):
    response = client_init.get("/datasources/637739d383ea7fda83e72a2d/nodes")
    assert response.status_code == 200
    assert response.json() == [
        {
            "id": "test1",
            "name": "test1",
            "properties": [
                {"name": "prop1", "type": "string"},
                {"name": "prop2", "type": "string"},
                {"name": "prop3", "type": "string"},
            ],
            "provider": "apperture",
            "source": "apperture",
        },
        {
            "id": "test2",
            "name": "test2",
            "properties": [
                {"name": "prop4", "type": "string"},
                {"name": "prop5", "type": "string"},
                {"name": "prop6", "type": "string"},
            ],
            "provider": "apperture",
            "source": "apperture",
        },
        {
            "id": "clicked on settings",
            "name": "clicked on settings",
            "properties": [
                {"name": "prop1", "type": "default"},
                {"name": "prop2", "type": "default"},
            ],
            "provider": "apperture",
            "source": "apperture",
        },
    ]
    assert events_service.get_unique_events.call_args.kwargs["datasource"].dict() == {
        "app_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "created_at": ANY,
        "enabled": True,
        "external_source_id": "123",
        "id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "integration_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "name": None,
        "provider": "apperture",
        "revision_id": None,
        "updated_at": None,
        "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        "version": "DEFAULT",
    }
    datasource_service.get_datasource.assert_called_with(
        **{"id": "637739d383ea7fda83e72a2d"}
    )
    event_properties_service.get_event_properties_for_datasource.assert_called_once_with(
        **{"datasource_id": "637739d383ea7fda83e72a2d"}
    )

    action_service.get_actions_for_datasource_id.assert_called_once_with(
        **{"datasource_id": "637739d383ea7fda83e72a2d"}
    )
    clickstream_event_properties_service.get_event_properties.assert_called_once()
    assert (
        action_service.get_props.call_args.kwargs["event_type"] == CaptureEvent.PAGEVIEW
    )
    assert action_service.get_props.call_args.kwargs["clickstream_event_properties"][
        0
    ].dict() == {
        "created_at": ANY,
        "event": CaptureEvent.AUTOCAPTURE,
        "id": None,
        "properties": [
            {"name": "prop1", "type": "string"},
            {"name": "prop4", "type": "string"},
            {"name": "prop3", "type": "string"},
        ],
        "revision_id": None,
        "updated_at": None,
    }
