from typing import List
from repositories.clickhouse.events import Events
from domain.segments.models import (
    SegmentFilterConditions,
    SegmentGroup,
    SegmentFilterOperators,
)
from pypika import ClickHouseQuery, Parameter, Field, Criterion


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
        query = ClickHouseQuery.from_(self.table).select(self.table.user_id).distinct()
        for column in columns:
            query = query.select(Field(f"properties.{column}"))

        criterion = [self.table.datasource_id == Parameter("%(ds_id)s")]
        for group in groups:
            for filter in group.filters:
                if filter.operator == SegmentFilterOperators.EQUALS:
                    criterion.append(
                        Field(f"properties.{filter.operand}").isin(filter.values)
                    )
            query = query.where(Criterion.all(criterion))
        return query.get_sql(), {"ds_id": datasource_id}
