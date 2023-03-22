import pytest
from unittest.mock import MagicMock

from pypika import Field

from domain.common.filter_models import (
    FilterDataType,
    FilterOperatorsNumber,
    FilterOperatorsBool,
    FilterOperatorsString,
)
from domain.segments.models import (
    WhereSegmentFilter,
    SegmentFilterConditions,
)
from repositories.clickhouse.utils.filters import Filters


class TestFiltersUtil:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Filters(self.clickhouse)
        self.repo = repo
        self.filters = [
            WhereSegmentFilter(
                operator=FilterOperatorsString.IS,
                operand="prop1",
                values=["va1", "val2"],
                all=False,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.WHERE,
                datatype=FilterDataType.STRING,
            ),
            WhereSegmentFilter(
                operator=FilterOperatorsString.IS,
                operand="prop2",
                values=["va3", "val4"],
                all=False,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.AND,
                datatype=FilterDataType.STRING,
            ),
        ]
        self.where_select_all_filters = [
            WhereSegmentFilter(
                operator=FilterOperatorsString.IS,
                operand="prop1",
                values=["va1", "val2"],
                all=False,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.WHERE,
                datatype=FilterDataType.STRING,
            ),
            WhereSegmentFilter(
                operator=FilterOperatorsString.IS,
                operand="prop2",
                values=["va3", "val4"],
                all=True,
                type=SegmentFilterConditions.WHERE,
                condition=SegmentFilterConditions.AND,
                datatype=FilterDataType.STRING,
            ),
        ]

    @pytest.mark.parametrize(
        "values, inverse, criteria",
        [
            ([1, 2, 3], True, "toFloat64OrDefault(properties.prop1) NOT IN (1,2,3)"),
            ([2], False, "toFloat64OrDefault(properties.prop1) IN (2)"),
        ],
    )
    def test_num_equality_criteria(self, values, inverse, criteria):
        assert (
            self.repo.num_equality_criteria(
                operand=self.repo.convert_to_float_func(Field("properties.prop1")),
                values=values,
                inverse=inverse,
            ).get_sql()
            == criteria
        )

    @pytest.mark.parametrize(
        "value, operator, criteria",
        [
            (
                5,
                FilterOperatorsNumber.GT,
                'toFloat64OrDefault("properties.prop1")>5',
            ),
            (
                10.0,
                FilterOperatorsNumber.LT,
                'toFloat64OrDefault("properties.prop1")<10.0',
            ),
            (
                99,
                FilterOperatorsNumber.GE,
                'toFloat64OrDefault("properties.prop1")>=99',
            ),
            (
                999,
                FilterOperatorsNumber.LE,
                'toFloat64OrDefault("properties.prop1")<=999',
            ),
        ],
    )
    def test_num_comparative_criteria(self, value, operator, criteria):
        assert (
            self.repo.num_comparative_criteria(
                operand=self.repo.convert_to_float_func(Field("properties.prop1")),
                value=value,
                operator=operator,
            ).get_sql()
            == criteria
        )

    @pytest.mark.parametrize(
        "inverse, criteria1, criteria2",
        [
            (
                True,
                'toFloat64OrDefault("properties.prop1")>=10',
                'toFloat64OrDefault("properties.prop1")<=5',
            ),
            (
                False,
                'toFloat64OrDefault("properties.prop1")>=5',
                'toFloat64OrDefault("properties.prop1")<=10',
            ),
        ],
    )
    def test_num_between_criteria(self, inverse, criteria1, criteria2):
        assert (
            self.repo.num_between_criteria(
                operand=self.repo.convert_to_float_func(Field("properties.prop1")),
                inverse=inverse,
                values=[5, 10],
            )[0].get_sql()
            == criteria1
        )
        assert (
            self.repo.num_between_criteria(
                operand=self.repo.convert_to_float_func(Field("properties.prop1")),
                inverse=inverse,
                values=[5, 10],
            )[1].get_sql()
            == criteria2
        )

    @pytest.mark.parametrize(
        "operator, criteria",
        [
            (FilterOperatorsBool.T, 'toBool("properties.prop1")=true'),
            (FilterOperatorsBool.F, 'toBool("properties.prop1")=false'),
        ],
    )
    def test_build_criterion_for_bool_filter(self, operator, criteria):
        bool_filter = WhereSegmentFilter(
            operator=operator,
            operand="prop1",
            values=[],
            all=False,
            type=SegmentFilterConditions.WHERE,
            condition=SegmentFilterConditions.WHERE,
            datatype=FilterDataType.BOOL,
        )
        assert (
            self.repo.build_criterion_for_bool_filter(filter=bool_filter)[0].get_sql()
            == criteria
        )
        assert len(self.repo.build_criterion_for_bool_filter(filter=bool_filter)) == 1

    def test_build_criterion_for_number_filter(self):
        num_filter = WhereSegmentFilter(
            operator=FilterOperatorsNumber.NE,
            operand="prop1",
            values=[10],
            all=False,
            type=SegmentFilterConditions.WHERE,
            condition=SegmentFilterConditions.WHERE,
            datatype=FilterDataType.NUMBER,
        )
        assert (
            self.repo.build_criterion_for_number_filter(filter=num_filter)[0].get_sql()
            == "toFloat64OrDefault(properties.prop1) NOT IN (10)"
        )

    def test_build_criterion_for_string_filter(self):
        assert (
            self.repo.build_criterion_for_string_filter(filter=self.filters[0])[
                0
            ].get_sql()
            == "properties.prop1 IN ('va1','val2')"
        )
