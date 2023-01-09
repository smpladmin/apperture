import json
from unittest.mock import ANY

from beanie import PydanticObjectId

from domain.segments.models import (
    SegmentGroup,
    WhereSegmentFilter,
    SegmentFilterOperatorsNumber,
    SegmentFilterOperatorsString,
    SegmentFilterOperatorsBool,
    SegmentFilterConditions,
    SegmentGroupConditions,
    SegmentDataType,
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
            "groups": [
                SegmentGroup(
                    filters=[
                        WhereSegmentFilter(
                            operator=SegmentFilterOperatorsString.IS,
                            operand="properties.$city",
                            values=["Delhi", "Indore", "Bhopal"],
                            all=False,
                            condition=SegmentFilterConditions.WHERE,
                            datatype=SegmentDataType.STRING,
                        ),
                        WhereSegmentFilter(
                            operator=SegmentFilterOperatorsString.IS,
                            operand="properties.$app_release",
                            values=["5003", "2077", "5002"],
                            all=False,
                            condition=SegmentFilterConditions.AND,
                            datatype=SegmentDataType.STRING,
                        ),
                    ],
                    condition=SegmentGroupConditions.AND,
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
    # segment_service.build_segment.assert_called_once_with(
    #     **{
    #         "appId": PydanticObjectId("636a1c61d715ca6baae65611"),
    #         "columns": ["properties.$app_release", "properties.$city"],
    #         "datasourceId": PydanticObjectId("63771fc960527aba9354399c"),
    #         "description": "test",
    #         "groups": [
    #             SegmentGroup(
    #                 filters=[
    #                     WhereSegmentFilter(
    #                         operand="properties.$city",
    #                         operator=SegmentFilterOperatorsString.IS,
    #                         values=["Delhi", "Indore", "Bhopal"],
    #                         type=SegmentFilterConditions.WHERE,
    #                         all=False,
    #                         condition=SegmentFilterConditions.WHERE,
    #                         datatype=SegmentDataType.STRING,
    #                     ),
    #                     WhereSegmentFilter(
    #                         operand="properties.$app_release",
    #                         operator=SegmentFilterOperatorsNumber.EQ,
    #                         values=[5003, 2077, 5002],
    #                         type=SegmentFilterConditions.WHERE,
    #                         all=False,
    #                         condition=SegmentFilterConditions.AND,
    #                         datatype=SegmentDataType.NUMBER,
    #                     ),
    #                 ],
    #                 condition=SegmentGroupConditions.AND,
    #             )
    #         ],
    #         "name": "name",
    #         "userId": ANY,
    #     }
    # )

    assert segment_service.add_segment.call_args.kwargs["segment"].dict() == {
        "app_id": PydanticObjectId("63771fc960527aba9354399c"),
        "columns": ["properties.$app_release", "properties.$city"],
        "created_at": ANY,
        "datasource_id": PydanticObjectId("63771fc960527aba9354399c"),
        "description": "test",
        "groups": [
            {
                "condition": SegmentGroupConditions.AND,
                "filters": [
                    {
                        "all": False,
                        "condition": SegmentFilterConditions.WHERE,
                        "operand": "properties.$city",
                        "operator": SegmentFilterOperatorsString.IS,
                        "type": SegmentFilterConditions.WHERE,
                        "values": ["Delhi", "Indore", "Bhopal"],
                        "datatype": SegmentDataType.STRING,
                    },
                    {
                        "all": False,
                        "condition": SegmentFilterConditions.AND,
                        "operand": "properties.$app_release",
                        "operator": SegmentFilterOperatorsString.IS,
                        "type": "where",
                        "values": ["5003", "2077", "5002"],
                        "datatype": SegmentDataType.STRING,
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


def test_get_segment(client_init, segment_service):
    response = client_init.get("/segments/63761779818ec577b69c21e6")
    assert response.status_code == 200
    segment_service.get_segment.assert_called_once_with(
        **{"segment_id": "63761779818ec577b69c21e6"}
    )


def test_get_segments(client_init, segment_service):
    response = client_init.get("/segments?app_id=63761779818ec577b69c21e6")
    assert response.status_code == 200
    segment_service.get_segments_for_app.assert_called_once_with(
        **{"app_id": "63761779818ec577b69c21e6"}
    )


def test_update_segment(
    client_init, segment_data, saved_segment_response, segment_service
):
    response = client_init.put(
        "/segments/635ba034807ab86d8a2d8", data=json.dumps(segment_data)
    )
    assert response.status_code == 200
    assert response.json() == saved_segment_response
    segment_service.build_segment.assert_called_with(
        **{
            "appId": PydanticObjectId("636a1c61d715ca6baae65611"),
            "columns": ["properties.$app_release", "properties.$city"],
            "datasourceId": PydanticObjectId("63771fc960527aba9354399c"),
            "description": "test",
            "groups": [
                SegmentGroup(
                    filters=[
                        WhereSegmentFilter(
                            operand="properties.$city",
                            operator=SegmentFilterOperatorsString.IS,
                            values=["Delhi", "Indore", "Bhopal"],
                            type=SegmentFilterConditions.WHERE,
                            all=False,
                            condition=SegmentFilterConditions.WHERE,
                            datatype=SegmentDataType.STRING,
                        ),
                        WhereSegmentFilter(
                            operand="properties.$app_release",
                            operator=SegmentFilterOperatorsString.IS,
                            values=["5003", "2077", "5002"],
                            type=SegmentFilterConditions.WHERE,
                            all=False,
                            condition=SegmentFilterConditions.AND,
                            datatype=SegmentDataType.STRING,
                        ),
                    ],
                    condition=SegmentGroupConditions.AND,
                )
            ],
            "name": "name",
            "userId": ANY,
        }
    )

    assert segment_service.update_segment.call_args.kwargs["new_segment"].dict() == {
        "app_id": PydanticObjectId("63771fc960527aba9354399c"),
        "columns": ["properties.$app_release", "properties.$city"],
        "created_at": ANY,
        "datasource_id": PydanticObjectId("63771fc960527aba9354399c"),
        "description": "test",
        "groups": [
            {
                "condition": SegmentGroupConditions.AND,
                "filters": [
                    {
                        "all": False,
                        "condition": SegmentFilterConditions.WHERE,
                        "operand": "properties.$city",
                        "operator": SegmentFilterOperatorsString.IS,
                        "type": SegmentFilterConditions.WHERE,
                        "values": ["Delhi", "Indore", "Bhopal"],
                        "datatype": SegmentDataType.STRING,
                    },
                    {
                        "all": False,
                        "condition": SegmentFilterConditions.AND,
                        "operand": "properties.$app_release",
                        "operator": SegmentFilterOperatorsString.IS,
                        "type": "where",
                        "values": ["5003", "2077", "5002"],
                        "datatype": SegmentDataType.STRING,
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
    assert (
        "635ba034807ab86d8a2d8"
        == segment_service.update_segment.call_args.kwargs["segment_id"]
    )
