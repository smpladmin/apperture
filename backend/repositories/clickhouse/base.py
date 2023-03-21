from abc import ABC
import datetime
import logging
from operator import le, ge
from typing import Union, Dict, List
from fastapi import Depends
from pypika import (
    Table,
    Parameter,
    CustomFunction,
    terms,
    Field,
)

from clickhouse import Clickhouse
from domain.common.date_models import (
    DateFilterType,
    FixedDateFilter,
    LastDateFilter,
    SinceDateFilter,
)
from domain.common.filter_models import (
    FilterOperatorsNumber,
    FilterOperatorsBool,
    FilterOperatorsString,
    FilterDataType,
)
from domain.segments.models import WhereSegmentFilter


class EventsBase(ABC):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = Table("events")
        self.click_stream_table = Table("clickstream")
        self.epoch_year = 1970
        self.week_func = CustomFunction("WEEK", ["timestamp"])
        self.date_func = CustomFunction("DATE", ["timestamp"])
        self.json_extract_keys_func = CustomFunction("JSONExtractKeys", ["string"])
        self.to_json_string_func = CustomFunction("toJSONString", ["json"])
        self.event_criterion = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            self.table.event_name == Parameter("%(event_name)s"),
            self.date_func(self.table.timestamp) >= Parameter("%(start_date)s"),
            self.date_func(self.table.timestamp) <= Parameter("%(end_date)s"),
        ]
        self.total_criterion = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            self.date_func(self.table.timestamp) >= Parameter("%(start_date)s"),
            self.date_func(self.table.timestamp) <= Parameter("%(end_date)s"),
        ]
        self.convert_to_float_func = CustomFunction("toFloat64OrDefault", ["string"])
        self.convert_to_numeric_func = CustomFunction("toFloat64OrNull", ["string"])
        self.convert_to_string_func = CustomFunction("toString", ["string"])
        self.convert_to_bool_func = CustomFunction("toBool", ["string"])
        self.ch_match_func = CustomFunction("match", ["column", "term"])
        self.parse_datetime_best_effort = CustomFunction(
            "parseDateTimeBestEffort", ["string"]
        )
        self.convert_to_unix_timestamp_func = CustomFunction(
            "toUnixTimestamp", ["datetime"]
        )

    def execute_get_query(self, query: str, parameters: Dict):
        logging.info(f"Executing query: {query}")
        logging.info(f"Parameters: {parameters}")
        try:
            query_result = self.clickhouse.client.query(
                query=query, parameters=parameters
            )
            return query_result.result_set
        except Exception as e:
            logging.info(e)
            return []

    def compute_date_filter(
        self,
        date_filter: Union[FixedDateFilter, LastDateFilter, SinceDateFilter],
        date_filter_type: DateFilterType,
    ):
        if date_filter_type == DateFilterType.FIXED:
            return date_filter.start_date, date_filter.end_date

        date_format = "%Y-%m-%d"
        today = datetime.datetime.today()
        end_date = today.strftime(date_format)

        return (
            (date_filter.start_date, end_date)
            if date_filter_type == DateFilterType.SINCE
            else (
                (today - datetime.timedelta(days=date_filter.days)).strftime(
                    date_format
                ),
                end_date,
            )
        )

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
        criterion = []
        operand = Field(f"properties.{filter.operand}")
        if filter.operator == FilterOperatorsString.IS:
            if not filter.all:
                criterion.append(operand.isin(filter.values))
        elif filter.operator == FilterOperatorsString.IS_NOT:
            criterion.append(operand.notin(filter.values))
        return criterion

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
