
from repositories.clickhouse.segments import Segments
from typing import List
from domain.metrics.models import SegmentsAndEventsType, SegmentsAndEvents,SegmentsAndEventsAggregationsFunctions,SegmentsAndEventsFilterOperator
from pypika import ClickHouseQuery, Parameter, Field, Criterion, functions as fn

class Metrics(Segments):
    def get_metric_result(
        self,
        datasource_id:str,
        aggregates:List[SegmentsAndEvents],
        breakdown:List[str],
        function:str
    ):
        query= ClickHouseQuery.from_(self.table).select(f"{function}")
        criterion = [self.table.datasource_id == Parameter("%(ds_id)s")]

        for aggregate in aggregates:
            subquery = ClickHouseQuery.from_(self.table)
            subquery_criterion =criterion
            function = aggregate.aggregations.functions
            property = aggregate.aggregations.property
            variable = aggregate.variable
            subquery= subquery.select(self.build_aggregation_function(function)).where(self.table.event_name == property)
            for filter in aggregate.filters:
                if filter.operator == SegmentsAndEventsFilterOperator.EQUALS:
                    subquery_criterion.append(
                        Field(f"properties.{filter.operand}").isin(filter.values)
                    )
            subquery = subquery.where(Criterion.all(subquery_criterion))
            query = query.select(subquery.as_(f"{variable}"))

        query = query.where(Criterion.all(criterion))
        print("Intermediate Metric Query: {0}".format(query.get_sql()))
        return self.execute_get_query(query.get_sql(), {"ds_id":datasource_id})

    def build_aggregation_function(
        self,
        function:SegmentsAndEventsAggregationsFunctions,
    ):
        if(function == SegmentsAndEventsAggregationsFunctions.SUM):
            return fn.Sum(self.table.event_name)
        if(function == SegmentsAndEventsAggregationsFunctions.COUNT):
            return fn.Count(self.table.event_name)

    def build_metric_aggregates_query(self):
        pass

