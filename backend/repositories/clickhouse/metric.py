import logging
from typing import List, Optional

from fastapi import Depends
from pypika import Case, ClickHouseQuery, Criterion, Field, Parameter
from pypika import functions as fn

from domain.metrics.models import (
    SegmentsAndEvents,
    SegmentsAndEventsAggregationsFunctions,
    SegmentsAndEventsFilterOperator,
)
from repositories.clickhouse.base import EventsBase
from repositories.clickhouse.parser.formula_parser import FormulaParser
from repositories.clickhouse.segments import Segments


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
        return self.execute_get_query(
            *self.build_metric_compute_query(
                datasource_id, aggregates, breakdown, function, start_date, end_date
            )
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
        innerquery = ClickHouseQuery.from_(self.table)
        for aggregate in aggregates:
            agg_function = aggregate.aggregations.functions
            property = aggregate.aggregations.property
            variable = aggregate.variable

            if agg_function == SegmentsAndEventsAggregationsFunctions.COUNT:
                innerquery = innerquery.select(fn.Date(Field("timestamp")).as_("date"))
                subquery_criterion = [Parameter("event_name") == property]
                for filter in aggregate.filters:
                    if filter.operator == SegmentsAndEventsFilterOperator.EQUALS:
                        subquery_criterion.append(
                            Field(f"properties.{filter.operand}").isin(filter.values)
                        )
                subquery = Case().when(Criterion.all(subquery_criterion), 1).else_(0)
                innerquery = innerquery.select(subquery.as_(variable))
                inner_criterion = [self.table.datasource_id == Parameter("%(ds_id)s")]
                if start_date:
                    inner_criterion.append(
                        fn.Date(Field("date")) >= fn.Date(start_date)
                    )
                if end_date:
                    inner_criterion.append(fn.Date(Field("date")) <= fn.Date(end_date))
            innerquery = innerquery.where(Criterion.all(inner_criterion))
        select_expressions, denominators_list = zip(
            *[parser.parse(definition, fn.Sum) for definition in function.split(",")]
        )
        having_clause = []
        for denominators in denominators_list:
            for denominator in denominators:
                if type(denominator) != int and type(denominator) != float:
                    having_clause.append(denominator != 0)

        query = (
            ClickHouseQuery.from_(innerquery.as_("innerquery"))
            .select(Parameter("date"))
            .groupby(Parameter("date"))
            .having(Criterion.all(having_clause))
            .limit(100)
        )
        for select_expression in select_expressions:
            query = query.select(select_expression)

        return query.get_sql(), {"ds_id": datasource_id}
