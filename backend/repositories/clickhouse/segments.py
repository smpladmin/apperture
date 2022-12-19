from typing import List
from repositories.clickhouse.events import Events
from domain.segments.models import (
    SegmentFilterConditions,
    SegmentGroup,
    SegmentFilterOperators,
)
from pypika import (
    ClickHouseQuery,
    Parameter,
    Field,
    Criterion,
    AliasedQuery,
    analytics as an,
    Order,
)


class Segments(Events):
    def get_segment(
        self,
        datasource_id: str,
        groups: List[SegmentGroup],
        columns: List[str],
        group_conditions: List[SegmentFilterConditions],
    ):
        return self.execute_get_query(
            *self.build_segment_query(
                datasource_id=datasource_id,
                groups=groups,
                columns=columns,
                group_conditions=group_conditions,
            )
        )

    def build_segment_query(
        self,
        datasource_id: str,
        groups: List[SegmentGroup],
        columns: List[str],
        group_conditions: List[SegmentFilterConditions],
    ):
        sub_query = ClickHouseQuery.from_(self.table).select(self.table.user_id)
        for column in columns:
            sub_query = sub_query.select(Field(f"properties.{column}"))

        sub_query = sub_query.select(
            an.Rank()
            .over(self.table.user_id)
            .orderby(self.table.timestamp, order=Order.desc)
            .as_("rank")
        )
        criterion = []
        for group in groups:
            for filter in group.filters:
                if group.conditions[0] == SegmentFilterConditions.WHERE:
                    if filter.operator == SegmentFilterOperators.EQUALS:
                        criterion.append(
                            Field(f"properties.{filter.operand}").isin(filter.values)
                        )
                elif group.conditions[0] == SegmentFilterConditions.WHERE:
                    pass
            sub_query = sub_query.where(
                self.table.datasource_id == Parameter("%(ds_id)s")
            )
            if SegmentFilterConditions.AND in group.conditions:
                sub_query = sub_query.where(Criterion.all(criterion))
            else:
                sub_query = sub_query.where(Criterion.any(criterion))

        cte_name = "cte"
        query = ClickHouseQuery.with_(sub_query, cte_name)
        cte = AliasedQuery(cte_name)
        query = query.from_(cte).select("*").where(Field("rank") == 1)
        return query.get_sql(), {"ds_id": datasource_id}
