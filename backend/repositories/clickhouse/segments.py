import copy
from typing import List, Union

from fastapi import Depends

from clickhouse import Clickhouse
from domain.common.filter_models import (
    LogicalOperators,
)
from repositories.clickhouse.base import EventsBase
from domain.segments.models import (
    SegmentFilterConditions,
    SegmentGroup,
    SegmentFixedDateFilter,
    SegmentLastDateFilter,
    SegmentSinceDateFilter,
    SegmentDateFilterType,
)
from pypika import (
    ClickHouseQuery,
    Parameter,
    Field,
    Criterion,
    AliasedQuery,
    analytics as an,
    functions as fn,
    Order,
    CustomFunction,
)
from pypika.dialects import ClickHouseQueryBuilder
import datetime

from repositories.clickhouse.utils.filters import Filters


class Segments(EventsBase):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        super().__init__(clickhouse=clickhouse)
        self.filter_utils = Filters()

    def get_all_unique_users_query(self):
        return (
            ClickHouseQuery.from_(self.table)
            .select(self.table.user_id)
            .distinct()
            .where(self.table.datasource_id == Parameter("%(ds_id)s"))
        )

    def build_where_clause_users_query(
        self, group: SegmentGroup, group_users: ClickHouseQueryBuilder
    ):
        conditions = [filter.condition for filter in group.filters]
        idx = (
            conditions.index(SegmentFilterConditions.WHO)
            if SegmentFilterConditions.WHO in conditions
            else len(conditions)
        )
        criterion = self.filter_utils.get_criterion_for_where_filters(
            filters=group.filters[:idx]
        )

        group_users = (
            group_users.where(Criterion.any(criterion))
            if SegmentFilterConditions.OR in conditions[:idx]
            else group_users.where(Criterion.all(criterion))
        )
        return group_users, idx

    def compute_date_filter(
        self,
        date_filter: Union[
            SegmentFixedDateFilter, SegmentLastDateFilter, SegmentSinceDateFilter
        ],
        date_filter_type: SegmentDateFilterType,
    ):
        if date_filter_type == SegmentDateFilterType.FIXED:
            return date_filter.start_date, date_filter.end_date

        date_format = "%Y-%m-%d"
        today = datetime.datetime.today()
        end_date = today.strftime(date_format)

        return (
            (date_filter.start_date, end_date)
            if date_filter_type == SegmentDateFilterType.SINCE
            else (
                (today - datetime.timedelta(days=date_filter.days)).strftime(
                    date_format
                ),
                end_date,
            )
        )

    def build_who_clause_users_query(
        self, group: SegmentGroup, group_users: ClickHouseQueryBuilder, idx: int
    ):
        query = ClickHouseQuery
        for i in range(idx, len(group.filters)):
            filter = group.filters[i]
            sub_query = ClickHouseQuery.from_(self.table).select(self.table.user_id)
            criterion = [
                self.table.datasource_id == Parameter("%(ds_id)s"),
                self.table.user_id.isin(group_users),
            ]
            start_date, end_date = self.compute_date_filter(
                date_filter=filter.date_filter, date_filter_type=filter.date_filter_type
            )
            criterion.append(self.date_func(self.table.timestamp) >= start_date)
            criterion.append(self.date_func(self.table.timestamp) <= end_date)
            if not filter.triggered:
                criterion.append(self.table.event_name != filter.operand)
                sub_query = sub_query.where(Criterion.all(criterion))
            else:
                criterion.append(self.table.event_name == filter.operand)
                sub_query = sub_query.where(Criterion.all(criterion)).groupby(
                    self.table.user_id
                )
                sub_query = sub_query.having(
                    filter.operator.get_pyoperator()(
                        fn.Count(self.table.user_id), filter.values[0]
                    )
                )

            query = query.with_(sub_query, f"cte{i}")

        group_users = (
            query.from_(AliasedQuery(f"cte{idx}"))
            .select(AliasedQuery(f"cte{idx}").user_id)
            .distinct()
        )
        filter_conditions = [filter.condition for filter in group.filters[idx:]]
        for i in range(idx + 1, len(group.filters)):
            filter_users = (
                ClickHouseQuery.from_(AliasedQuery(f"cte{i}"))
                .select(AliasedQuery(f"cte{i}").user_id)
                .distinct()
            )

            group_users = (
                group_users.intersect(filter_users)
                if SegmentFilterConditions.AND in filter_conditions
                else group_users.union_all(filter_users)
            )

        return group_users

    def build_segment_users_query(
        self,
        groups: List[SegmentGroup],
    ):
        segment_users = self.get_all_unique_users_query()
        query = ClickHouseQuery

        for i, group in enumerate(groups):
            idx = 0
            filter_conditions = [filter.condition for filter in group.filters]
            group_users = copy.deepcopy(segment_users)

            if SegmentFilterConditions.WHERE in filter_conditions:
                group_users, idx = self.build_where_clause_users_query(
                    group=group, group_users=group_users
                )

            if SegmentFilterConditions.WHO in filter_conditions:
                group_users = self.build_who_clause_users_query(
                    group=group, group_users=group_users, idx=idx
                )

            query = query.with_(group_users, f"group{i}")

        segment_users = (
            query.from_(AliasedQuery(f"group{0}"))
            .select(AliasedQuery(f"group{0}").user_id)
            .distinct()
        )

        if len(groups) > 1:
            for i, group in enumerate(groups[1:]):
                group_users = (
                    ClickHouseQuery.from_(AliasedQuery(f"group{i+1}"))
                    .select(AliasedQuery(f"group{i+1}").user_id)
                    .distinct()
                )

                segment_users = (
                    segment_users.intersect(group_users)
                    if group.condition == LogicalOperators.AND
                    else segment_users.union_all(group_users)
                )

        return segment_users

    def build_valid_column_data_query(
        self,
        column: str,
        segment_user_ids: Union[List, None] = None,
        segment_users_query: Union[ClickHouseQuery, None] = None,
    ):
        to_string_func = CustomFunction("toString", ["string"])
        char_length_func = CustomFunction("char_length", ["string"])
        criterion = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            char_length_func(to_string_func(Field(f"properties.{column}"))) > 0,
        ]
        criterion.append(
            self.table.user_id.isin(segment_user_ids)
        ) if segment_user_ids else criterion.append(
            self.table.user_id.isin(segment_users_query)
        )
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
        return query.get_sql(with_alias=True)

    def get_segment_data(
        self,
        datasource_id: str,
        groups: List[SegmentGroup],
        columns: List[str],
    ):
        params = {"ds_id": datasource_id}
        segment_users_query = self.build_segment_users_query(
            groups=groups,
        )

        user_data = self.execute_get_query(
            query=segment_users_query.get_sql(), parameters=params
        )
        user_ids = list(set([x[0] for x in user_data]))
        segment_count = len(user_ids)

        if segment_count == 0:
            return [], segment_count

        user_ids = user_ids[:100]
        segment_data = [{"user_id": x} for x in user_ids]
        if not columns:
            return segment_data, segment_count

        for column in columns:
            column_data_query = self.build_valid_column_data_query(
                column=column, segment_user_ids=user_ids
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

        return segment_data, segment_count
