import json
from unittest.mock import ANY

from beanie import PydanticObjectId

from domain.segments.models import (
    SegmentGroup,
    SegmentFilter,
    SegmentFilterOperators,
    SegmentFilterConditions,
)


def test_compute_transient_segment(
    client_init, transient_segment_data, computed_segment_response, segment_service
):
    response = client_init.post(
        "/segments/transient", data=json.dumps(transient_segment_data)
    )
    assert response.status_code == 200
    assert response.json() == computed_segment_response
    segment_service.compute_segment.assert_called_once_with(
        **{
            "columns": ["properties.$app_release", "properties.$city"],
            "datasource_id": "63771fc960527aba9354399c",
            "group_conditions": [],
            "groups": [
                SegmentGroup(
                    filters=[
                        SegmentFilter(
                            operator=SegmentFilterOperators.EQUALS,
                            operand="properties.$city",
                            values=["Delhi", "Indore", "Bhopal"],
                        ),
                        SegmentFilter(
                            operator=SegmentFilterOperators.EQUALS,
                            operand="properties.$app_release",
                            values=["5003", "2077", "5002"],
                        ),
                    ],
                    conditions=[
                        SegmentFilterConditions.WHERE,
                        SegmentFilterConditions.AND,
                    ],
                )
            ],
        }
    )


def test_save_segment(
    client_init, segment_data, saved_segment_response, segment_service
):
    response = client_init.post("/segments", data=json.dumps(segment_data))
    assert response.status_code == 200
    assert response.json() == saved_segment_response
    segment_service.build_segment.assert_called_once_with(
        **{
            "appId": PydanticObjectId("636a1c61d715ca6baae65611"),
            "columns": ["properties.$app_release", "properties.$city"],
            "datasourceId": PydanticObjectId("63771fc960527aba9354399c"),
            "description": "test",
            "groupConditions": [],
            "groups": [
                SegmentGroup(
                    filters=[
                        SegmentFilter(
                            operand="properties.$city",
                            operator=SegmentFilterOperators.EQUALS,
                            values=["Delhi", "Indore", "Bhopal"],
                        ),
                        SegmentFilter(
                            operand="properties.$app_release",
                            operator=SegmentFilterOperators.EQUALS,
                            values=["5003", "2077", "5002"],
                        ),
                    ],
                    conditions=[
                        SegmentFilterConditions.WHERE,
                        SegmentFilterConditions.AND,
                    ],
                )
            ],
            "name": "name",
            "userId": ANY,
        }
    )

    assert segment_service.add_segment.call_args.kwargs["segment"].dict() == {
        "app_id": PydanticObjectId("63771fc960527aba9354399c"),
        "columns": ["properties.$app_release", "properties.$city"],
        "created_at": ANY,
        "datasource_id": PydanticObjectId("63771fc960527aba9354399c"),
        "description": "test",
        "group_conditions": [],
        "groups": [
            {
                "conditions": [
                    SegmentFilterConditions.WHERE,
                    SegmentFilterConditions.AND,
                ],
                "filters": [
                    {
                        "operand": "properties.$city",
                        "operator": SegmentFilterOperators.EQUALS,
                        "values": ["Delhi", "Indore", "Bhopal"],
                    },
                    {
                        "operand": "properties.$app_release",
                        "operator": SegmentFilterOperators.EQUALS,
                        "values": ["5003", "2077", "5002"],
                    },
                ],
            }
        ],
        "id": None,
        "name": "name",
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("63771fc960527aba9354399c"),
    }
