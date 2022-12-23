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
    functions as fn,
    Order, CustomFunction,
)
from pypika.dialects import ClickHouseQueryBuilder


class Segments(Events):
    def get_all_unique_users_query(self):
        return (
            ClickHouseQuery.from_(self.table)
            .select(self.table.user_id)
            .distinct()
            .where(self.table.datasource_id == Parameter("%(ds_id)s"))
        )

    def build_where_clause_users_query(self, group: SegmentGroup, segment_users: ClickHouseQueryBuilder):
        criterion = []
        idx = 0
        for i, filter in enumerate(group.filters):
            if group.conditions[i] == SegmentFilterConditions.WHO:
                idx = i
                break
            if filter.operator == SegmentFilterOperators.EQUALS:
                criterion.append(
                    Field(f"properties.{filter.operand}").isin(filter.values)
                )

        where_idx = idx if idx != 0 else len(group.filters)
        segment_users = (
            segment_users.where(Criterion.any(criterion))
            if SegmentFilterConditions.OR in group.conditions[:where_idx]
            else segment_users.where(Criterion.all(criterion))
        )
        return segment_users, idx

    def build_who_clause_users_query(self, group: SegmentGroup, segment_users: ClickHouseQueryBuilder, idx: int):
        query = ClickHouseQuery
        for i in range(idx, len(group.conditions)):
            filter = group.filters[i]
            sub_query = ClickHouseQuery.from_(self.table).select(
                self.table.user_id
            )
            criterion = [
                self.table.datasource_id == Parameter("%(ds_id)s"),
                self.table.user_id.isin(segment_users),
            ]
            if not filter.triggered:
                criterion.append(self.table.event_name != filter.operand)
                sub_query = sub_query.where(Criterion.all(criterion))
            else:
                criterion.append(self.table.event_name == filter.operand)
                sub_query = (
                    sub_query.where(Criterion.all(criterion))
                    .groupby(self.table.user_id)
                    .having(fn.Count(self.table.user_id) == filter.values[0])
                )
            query = query.with_(sub_query, f"cte{i}")

        segment_users = query.from_(AliasedQuery(f"cte{idx}")).select(
            AliasedQuery(f"cte{idx}").user_id
        )
        for i in range(idx + 1, len(group.filters)):
            filter_users = ClickHouseQuery.from_(
                AliasedQuery(f"cte{i}")
            ).select(AliasedQuery(f"cte{i}").user_id).distinct()

            segment_users = (
                segment_users.intersect(filter_users)
                if SegmentFilterConditions.AND in group.conditions[idx:]
                else segment_users.union_all(filter_users)
            )

        return segment_users

    def build_segment_users_query(
        self,
        groups: List[SegmentGroup],
        group_conditions: List[SegmentFilterConditions],
    ):
        segment_users = self.get_all_unique_users_query()

        for group in groups:
            idx = 0
            if SegmentFilterConditions.WHERE in group.conditions:
                segment_users, idx = self.build_where_clause_users_query(group=group, segment_users=segment_users)

            if SegmentFilterConditions.WHO in group.conditions:
                segment_users = self.build_who_clause_users_query(group=group, segment_users=segment_users, idx=idx)

        return segment_users

    def build_valid_column_data_query(
        self, column: str, segment_users_query: ClickHouseQuery
    ):
        to_string_func = CustomFunction("toString", ["string"])
        char_length_func = CustomFunction("char_length", ["string"])
        criterion = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            self.table.user_id.isin(segment_users_query),
            char_length_func(to_string_func(Field(f"properties.{column}"))) > 0,
        ]
        sub_query = (
            ClickHouseQuery.from_(self.table)
            .select(
                self.table.user_id,
                self.table.timestamp,
                Field(f"properties.{column}"),
                an.Rank()
                .over(self.table.user_id)
                .orderby(self.table.timestamp, order=Order.desc)
                .as_("Rank"),
            )
            .where(Criterion.all(criterion))
            .orderby(self.table.user_id)
        )
        query = (
            ClickHouseQuery.with_(sub_query, "column_data")
            .from_(AliasedQuery("column_data"))
            .select(Field(f"properties.{column}"), self.table.user_id)
            .where(Field("Rank") == 1)
            .orderby(self.table.user_id)
        )
        return query.get_sql()

    def get_segment_data(
        self,
        datasource_id: str,
        groups: List[SegmentGroup],
        columns: List[str],
        group_conditions: List[SegmentFilterConditions],
    ):
        params = {"ds_id": datasource_id}
        segment_users_query = self.build_segment_users_query(
            groups=groups,
            group_conditions=group_conditions,
        )

        user_data = self.execute_get_query(
            query=segment_users_query.get_sql(), parameters=params
        )
        segment_data = [{"user_id": x[0]} for x in user_data]
        if not columns:
            return segment_data

        for column in columns:
            column_data_query = self.build_valid_column_data_query(
                column=column, segment_users_query=segment_users_query
            )
            column_data = self.execute_get_query(
                query=column_data_query, parameters=params
            )
            uids = [uid for (data, uid) in column_data]

            for row in segment_data:

                if row["user_id"] in uids:
                    row[column] = column_data[uids.index(row["user_id"])][0]
                else:
                    row[column] = ""

        return segment_data
