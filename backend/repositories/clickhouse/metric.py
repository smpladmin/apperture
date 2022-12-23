
from repositories.clickhouse.segments import Segments
from typing import List
from domain.metrics.models import SegmentsAndEventsType, SegmentsAndEvents,SegmentsAndEventsAggregationsFunctions,SegmentsAndEventsFilterOperator
from pypika import ClickHouseQuery, Parameter, Field, Criterion, functions as fn,Case

class Metrics(Segments):
    def get_metric_result(
        self,
        datasource_id:str,
        aggregates:List[SegmentsAndEvents],
        breakdown:List[str],
        function:str
    ):
        return self.execute_get_query(
            *self.build_metric_compute_query(
                datasource_id=datasource_id,
                aggregates=aggregates,
                breakdown=breakdown,
                function=function
            )
        )
        

    def build_aggregation_function(
        self,
        function:SegmentsAndEventsAggregationsFunctions,
    ):
        if(function == SegmentsAndEventsAggregationsFunctions.SUM):
            return fn.Sum(self.table.event_name)
        if(function == SegmentsAndEventsAggregationsFunctions.COUNT):
            return fn.Count(self.table.event_name)

    def build_metric_compute_query(
        self,
        datasource_id:str,
        aggregates:List[SegmentsAndEvents],
        breakdown:List[str],
        function:str
    ):
        innerquery = ClickHouseQuery.from_(self.table)
        for aggregate in aggregates:
            function = aggregate.aggregations.functions
            property = aggregate.aggregations.property
            variable = aggregate.variable
            # subquery= subquery.select(self.build_aggregation_function(function)).where(self.table.event_name == property)
            if function == SegmentsAndEventsAggregationsFunctions.COUNT:
                innerquery = innerquery.select(fn.Date(Field("timestamp")).as_("date"))
                subquery_criterion =[Parameter("event_name") ==str(property)]
                for filter in aggregate.filters:
                    if filter.operator == SegmentsAndEventsFilterOperator.EQUALS:
                        subquery_criterion.append(
                            Field(f"properties.{filter.operand}").isin(filter.values)
                        )
                subquery = Case().when(Criterion.all(subquery_criterion),1).else_(0)
                innerquery = innerquery.select(subquery.as_(variable))
            innerquery = innerquery.where(self.table.datasource_id == Parameter("%(ds_id)s"))
        query = ClickHouseQuery.from_(innerquery.as_("innerquery")).select(Parameter("date"),fn.Sum(Field('A'))).groupby(Parameter("date"))
        return query.get_sql(), {"ds_id":datasource_id}

