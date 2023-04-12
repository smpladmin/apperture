from operator import le, ge
from typing import List
from pypika import (
    terms,
    Field,
)

from domain.common.filter_models import (
    FilterOperatorsNumber,
    FilterOperatorsBool,
    FilterOperatorsString,
    FilterDataType,
)
from domain.segments.models import WhereSegmentFilter
from repositories.clickhouse.base import EventsBase


class Filters(EventsBase):
    def num_equality_criteria(
        self, operand: terms.Function, values: List, inverse=False
    ):
        return operand.isin(values) if not inverse else operand.notin(values)

    def num_comparative_criteria(
        self,
        operand: terms.Function,
        value: float,
        operator: FilterOperatorsNumber,
    ):
        return operator.get_pyoperator()(operand, value)

    def num_between_criteria(
        self, operand: terms.Function, values: List[float], inverse: bool = False
    ) -> List:
        return [
            ge(
                operand,
                values[0] if not inverse else values[1],
            ),
            le(
                operand,
                values[1] if not inverse else values[0],
            ),
        ]

    def build_criterion_for_number_filter(self, filter: WhereSegmentFilter):
        criterion = []
        operand = self.convert_to_float_func(Field(f"properties.{filter.operand}"))

        if filter.operator in [
            FilterOperatorsNumber.EQ,
            FilterOperatorsNumber.NE,
        ]:
            criterion.append(
                self.num_equality_criteria(
                    operand=operand,
                    values=filter.values,
                    inverse=(filter.operator == FilterOperatorsNumber.NE),
                )
            )

        elif filter.operator in [
            FilterOperatorsNumber.GT,
            FilterOperatorsNumber.LT,
            FilterOperatorsNumber.GE,
            FilterOperatorsNumber.LE,
        ]:
            criterion.append(
                self.num_comparative_criteria(
                    operand=operand, value=filter.values[0], operator=filter.operator
                )
            )
        elif filter.operator in [
            FilterOperatorsNumber.BETWEEN,
            FilterOperatorsNumber.NOT_BETWEEN,
        ]:
            criterion.extend(
                self.num_between_criteria(
                    operand=operand,
                    values=filter.values[:2],
                    inverse=(filter.operator == FilterOperatorsNumber.NOT_BETWEEN),
                )
            )

        return criterion

    def build_criterion_for_bool_filter(self, filter: WhereSegmentFilter):
        criterion = []
        operand = self.convert_to_bool_func(Field(f"properties.{filter.operand}"))
        if filter.operator == FilterOperatorsBool.T:
            criterion.append(operand == True)
        else:
            criterion.append(operand == False)
        return criterion

    def build_criterion_for_string_filter(self, filter: WhereSegmentFilter):
        operator_mapping = {
            FilterOperatorsString.IS: lambda o, v: [o.isin(v)],
            FilterOperatorsString.IS_NOT: lambda o, v: [o.notin(v)],
            FilterOperatorsString.CONTAINS: lambda o, v: [o.ilike(f"%%{v[0]}%%")],
            FilterOperatorsString.DOES_NOT_CONTAIN: lambda o, v: [
                o.not_ilike(f"%%{v[0]}%%")
            ],
        }
        operand = Field(f"properties.{filter.operand}")
        default_func = lambda o, v: []
        operator_func = (
            operator_mapping.get(filter.operator, default_func)
            if not filter.all
            else default_func
        )
        return operator_func(operand, filter.values)

    def get_criterion_for_where_filters(self, filters: List[WhereSegmentFilter]):
        criterion = []
        for i, filter in enumerate(filters):
            if filter.datatype == FilterDataType.NUMBER:
                criterion.extend(self.build_criterion_for_number_filter(filter=filter))
            elif filter.datatype == FilterDataType.BOOL:
                criterion.extend(self.build_criterion_for_bool_filter(filter=filter))
            else:
                criterion.extend(self.build_criterion_for_string_filter(filter=filter))

        return criterion
