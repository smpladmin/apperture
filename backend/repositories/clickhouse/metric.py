import itertools
from typing import List, Optional

from pypika.terms import NullValue
from pypika import (
    Case,
    ClickHouseQuery,
    Criterion,
    Field,
    Parameter,
    functions as fn,
    analytics as an,
)

from domain.metrics.models import (
    SegmentsAndEvents,
    MetricBasicAggregation,
    MetricAggregatePropertiesAggregation,
    SegmentsAndEventsFilterOperator,
)
from repositories.clickhouse.base import EventsBase
from repositories.clickhouse.parser.formula_parser import FormulaParser


class Metrics(EventsBase):
    def compute_query(
        self,
        datasource_id: str,
        aggregates: List[SegmentsAndEvents],
        breakdown: List[str],
        function: str,
        start_date: Optional[str],
        end_date: Optional[str],
    ):
        query, parameters = self.build_metric_compute_query(
            datasource_id, aggregates, breakdown, function, start_date, end_date
        )

        return (
            None
            if query is None
            else self.execute_get_query(query=query, parameters=parameters)
        )

    def build_metric_compute_query(
        self,
        datasource_id: str,
        aggregates: List[SegmentsAndEvents],
        breakdown: List[str],
        function: str,
        start_date: Optional[str],
        end_date: Optional[str],
    ):
        parser = FormulaParser()
        subquery = ClickHouseQuery.from_(self.table).select(
            fn.Date(self.table.timestamp).as_("date")
        )

        breakdown_columns = [Field(f"properties.{prop}") for prop in breakdown]
        if breakdown:
            subquery = subquery.select(*breakdown_columns)

        params = {"ds_id": datasource_id}
        criterion = [self.table.datasource_id == Parameter("%(ds_id)s")]

        if start_date:
            criterion.append(fn.Date(self.table.timestamp) >= start_date)
        if end_date:
            criterion.append(fn.Date(self.table.timestamp) <= end_date)

        subquery = subquery.where(Criterion.all(criterion))

        agg_funcs = {}
        for i, aggregate in enumerate(aggregates):

            subquery_criterion = [
                self.table.event_name == Parameter(f"%(reference_id_{i})s")
            ]
            subquery_criterion.extend(
                [
                    Field(f"properties.{filter.operand}").isin(filter.values)
                    for filter in aggregate.filters
                    if filter.operator == SegmentsAndEventsFilterOperator.EQUALS
                ]
            )

            params[f"reference_id_{i}"] = aggregate.reference_id

            if aggregate.aggregations.function in MetricAggregatePropertiesAggregation:
                agg_funcs[aggregate.variable] = aggregate.aggregations.function.get_pypika_function()
                func = (
                    self.convert_to_string_func
                    if aggregate.aggregations.function
                    == MetricAggregatePropertiesAggregation.DISTINCT_COUNT
                    else self.convert_to_numeric_func
                )

                agg_property = Field(f"properties.{aggregate.aggregations.property}")
                if aggregate.aggregations.function != MetricAggregatePropertiesAggregation.DISTINCT_COUNT:
                    agg_property = self.convert_to_string_func(agg_property)
                alt_value = NullValue()

            elif aggregate.aggregations.function == MetricBasicAggregation.UNIQUE:
                agg_funcs[aggregate.variable] = fn.Count
                agg_property = self.table.user_id
                alt_value = NullValue()
                func = self.convert_to_string_func
            else:
                agg_funcs[aggregate.variable] = fn.Sum
                agg_property = "1"
                alt_value = 0
                func = self.convert_to_numeric_func

            subquery = subquery.select(
                Case()
                .when(
                    Criterion.all(subquery_criterion),
                    func(agg_property),
                )
                .else_(alt_value)
                .as_(aggregate.variable)
            )

        select_expressions, denominators_list = zip(
            *[parser.parse(function=definition, wrapper_functions=agg_funcs) for definition in function.split(",")]
        )

        for expression in select_expressions:
            if not expression:
                return None, None

        having_clause = [
            denominator != 0
            for denominator in list(itertools.chain.from_iterable(denominators_list))
            if type(denominator) != int and type(denominator) != float
        ]

        query = (
            ClickHouseQuery.from_(subquery.as_("subquery"))
            .select(Parameter("date"))
            .groupby(Parameter("date"))
        )

        if breakdown:
            query = query.select(*breakdown_columns).groupby(*breakdown_columns)

        query = query.having(Criterion.all(having_clause)).orderby(1)
        if breakdown:
            for i in range(len(breakdown)):
                query = query.orderby(i + 2)
        query = query.select(
            *[select_expression for select_expression in select_expressions]
        ).limit(1000)

        return query.get_sql(), params
