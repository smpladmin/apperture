import json

from domain.segments.models import (
    SegmentGroup,
    SegmentFilter,
    SegmentFilterOperators,
    SegmentFilterConditions,
)


def test_compute_transient_segment(
    client_init, segment_data, computed_segment_response, segment_service
):
    response = client_init.post("/segments/transient", data=json.dumps(segment_data))
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
