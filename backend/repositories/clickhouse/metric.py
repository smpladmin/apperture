from typing import List, Optional
from pypika import Case, ClickHouseQuery, Criterion, Field, Parameter, functions as fn

from domain.metrics.models import (
    SegmentsAndEvents,
    SegmentsAndEventsAggregationsFunctions,
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
        params = {"ds_id": datasource_id}
        subquery = ClickHouseQuery.from_(self.table).select(
            fn.Date(self.table.timestamp).as_("date")
        )

        if breakdown:
            for property in breakdown:
                subquery = subquery.select(Field(f"properties.{property}"))

        criterion = [self.table.datasource_id == Parameter("%(ds_id)s")]

        if start_date:
            criterion.append(fn.Date(self.table.timestamp) >= start_date)
        if end_date:
            criterion.append(fn.Date(self.table.timestamp) <= end_date)

        subquery = subquery.where(Criterion.all(criterion))

        for i, aggregate in enumerate(aggregates):
            if (
                aggregate.aggregations.functions
                == SegmentsAndEventsAggregationsFunctions.COUNT
            ):
                subquery_criterion = [
                    self.table.event_name == Parameter(f"%(property_{i})s")
                ]
                params[f"property_{i}"] = aggregate.aggregations.property

                for filter in aggregate.filters:
                    if filter.operator == SegmentsAndEventsFilterOperator.EQUALS:
                        subquery_criterion.append(
                            Field(f"properties.{filter.operand}").isin(filter.values)
                        )

                subquery = subquery.select(
                    Case()
                    .when(Criterion.all(subquery_criterion), 1)
                    .else_(0)
                    .as_(aggregate.variable)
                )

        select_expressions, denominators_list = zip(
            *[parser.parse(definition, fn.Sum) for definition in function.split(",")]
        )

        for expression in select_expressions:
            if expression is None:
                return None, None

        having_clause = []
        for denominators in denominators_list:
            for denominator in denominators:
                if type(denominator) != int and type(denominator) != float:
                    having_clause.append(denominator != 0)

        query = (
            ClickHouseQuery.from_(subquery.as_("subquery"))
            .select(Parameter("date"))
            .groupby(Parameter("date"))
        )

        if breakdown:
            for property in breakdown:
                query = query.select(Field(f"properties.{property}")).groupby(
                    Field(f"properties.{property}")
                )

        query = query.having(Criterion.all(having_clause)).orderby(1)
        if breakdown:
            for i in range(len(breakdown)):
                query = query.orderby(i + 2)
        query = query.limit(1000)
        for select_expression in select_expressions:
            query = query.select(select_expression)

        return query.get_sql(), params
