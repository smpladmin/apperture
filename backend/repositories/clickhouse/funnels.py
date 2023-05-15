from typing import List, Tuple, Union

from fastapi import Depends
from pypika import (
    NULL,
    AliasedQuery,
    Case,
    ClickHouseQuery,
    Criterion,
    DatePart,
    Field,
    Parameter,
    Table,
)
from pypika import functions as fn
from pypika.functions import Extract

from clickhouse import Clickhouse
from domain.funnels.models import ConversionStatus, FunnelStep
from repositories.clickhouse.base import EventsBase
from repositories.clickhouse.utils.filters import Filters


class Funnels(EventsBase):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        super().__init__(clickhouse=clickhouse)
        self.filter_utils = Filters()

    def get_conversion_trend(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        start_date: Union[str, None],
        end_date: Union[str, None],
        conversion_time: int,
        random_sequence: Union[bool, None],
        segment_filter_query: Union[ClickHouseQuery, None],
        inclusion_criterion: Union[bool, None],
    ) -> List[Tuple]:
        return self.execute_get_query(
            *self.build_trends_query(
                ds_id=ds_id,
                steps=steps,
                start_date=start_date,
                end_date=end_date,
                conversion_time=conversion_time,
                random_sequence=random_sequence,
                segment_filter_query=segment_filter_query,
                inclusion_criterion=inclusion_criterion,
            )
        )

    def get_conversion_analytics(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        status: ConversionStatus,
        start_date: Union[str, None],
        end_date: Union[str, None],
        conversion_time: int,
        random_sequence: Union[bool, None],
        segment_filter_query: Union[ClickHouseQuery, None],
        inclusion_criterion: Union[bool, None],
    ):
        if len(steps) == 1:
            return self.get_initial_users(
                ds_id=ds_id,
                steps=steps,
                status=status,
                start_date=start_date,
                end_date=end_date,
                segment_filter_query=segment_filter_query,
                inclusion_criterion=inclusion_criterion,
            )

        query, parameter = self.build_analytics_query(
            ds_id,
            steps,
            status,
            start_date=start_date,
            end_date=end_date,
            conversion_time=conversion_time,
            random_sequence=random_sequence,
            segment_filter_query=segment_filter_query,
            inclusion_criterion=inclusion_criterion,
        )
        return self.execute_get_query(query, parameter)

    def get_initial_users(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        status: ConversionStatus,
        start_date: Union[str, None],
        end_date: Union[str, None],
        segment_filter_query: Union[ClickHouseQuery, None],
        inclusion_criterion: Union[bool, None],
    ) -> List[Tuple]:
        if status == ConversionStatus.DROPPED:
            return []

        conditions = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            self.table.event_name == Parameter(f"%(event0)s"),
        ]

        if start_date and end_date:
            conditions.extend(
                [
                    self.date_func(self.table.timestamp) >= start_date,
                    self.date_func(self.table.timestamp) <= end_date,
                ]
            )

        query = ClickHouseQuery.from_(self.table)
        if segment_filter_query and inclusion_criterion is not None:
            query = query.with_(segment_filter_query, "segment_users")
            conditions.extend(
                [
                    self.table.user_id.isin(AliasedQuery("segment_users"))
                    if inclusion_criterion
                    else self.table.user_id.notin(AliasedQuery("segment_users"))
                ]
            )
        query = query.where(Criterion.all(conditions))
        count = query.select(
            fn.Count(self.table.user_id),
            fn.Count(self.table.user_id).distinct(),
        )
        return self.execute_get_query(
            query.select(self.table.user_id, count).limit(100).get_sql(),
            {
                "ds_id": ds_id,
                "epoch_year": self.epoch_year,
                "event0": steps[0].event,
            },
        )

    def get_users_count(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        start_date: Union[str, None],
        end_date: Union[str, None],
        conversion_time: int,
        random_sequence: Union[bool, None],
        segment_filter_query: Union[ClickHouseQuery, None],
        inclusion_criterion: Union[bool, None],
    ) -> List[Tuple]:
        return self.execute_get_query(
            *self.build_users_query(
                ds_id=ds_id,
                steps=steps,
                start_date=start_date,
                end_date=end_date,
                conversion_time=conversion_time,
                random_sequence=random_sequence,
                segment_filter_query=segment_filter_query,
                inclusion_criterion=inclusion_criterion,
            )
        )

    def _anyorder_builder(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        start_date: Union[str, None],
        end_date: Union[str, None],
        segment_filter_query: Union[ClickHouseQuery, None],
        inclusion_criterion: Union[bool, None],
    ):
        innerQuery = ClickHouseQuery
        parameters = {"ds_id": ds_id, "epoch_year": self.epoch_year}
        date_criterion = []
        if start_date and end_date:
            date_criterion.extend(
                [
                    self.date_func(self.table.timestamp) >= start_date,
                    self.date_func(self.table.timestamp) <= end_date,
                ]
            )

        if segment_filter_query:
            innerQuery = innerQuery.with_(segment_filter_query, "segment_users")

        for i, step in enumerate(steps):
            criterion = [
                self.table.datasource_id == Parameter("%(ds_id)s"),
                self.table.event_name == Parameter(f"%(event{i})s"),
            ]
            if step.filters:
                filter_criterion = self.filter_utils.get_criterion_for_where_filters(
                    filters=step.filters
                )
                criterion.extend(filter_criterion)

            if segment_filter_query:
                criterion.extend(
                    [
                        self.table.user_id.isin(AliasedQuery("segment_users"))
                        if inclusion_criterion
                        else self.table.user_id.notin(AliasedQuery("segment_users"))
                    ]
                )

            parameters[f"event{i}"] = step.event
            stepQuery = (
                ClickHouseQuery.from_(self.table)
                .select(self.table.user_id)
                .where(Criterion.all(criterion))
                .groupby(1)
                .having(Criterion.all(date_criterion))
            )
            stepQuery = stepQuery.select(
                fn.Min(self.table.timestamp).as_("ts")
                if i == 0
                else fn.Max(self.table.timestamp).as_("ts")
            )
            if i > 0:
                stepQuery = (
                    ClickHouseQuery.from_(stepQuery)
                    .select("*")
                    .join(AliasedQuery(f"table{i}"))
                    .on_field("user_id")
                )

            innerQuery = innerQuery.with_(stepQuery, f"table{i+1}")
        return innerQuery, parameters

    def _builder(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        start_date: Union[str, None],
        end_date: Union[str, None],
        random_sequence: Union[bool, None],
        segment_filter_query: Union[ClickHouseQuery, None],
        inclusion_criterion: Union[bool, None],
    ):
        if random_sequence:
            return self._anyorder_builder(
                ds_id=ds_id,
                steps=steps,
                start_date=start_date,
                end_date=end_date,
                segment_filter_query=segment_filter_query,
                inclusion_criterion=inclusion_criterion,
            )
        query = ClickHouseQuery
        parameters = {"ds_id": ds_id, "epoch_year": self.epoch_year}
        date_criterion = []
        if start_date and end_date:
            date_criterion.extend(
                [
                    self.date_func(self.table.timestamp) >= start_date,
                    self.date_func(self.table.timestamp) <= end_date,
                ]
            )

        if segment_filter_query:
            query = query.with_(segment_filter_query, "segment_users")

        for i, step in enumerate(steps):
            criterion = [
                self.table.datasource_id == Parameter("%(ds_id)s"),
                self.table.event_name == Parameter(f"%(event{i})s"),
            ]
            if step.filters:
                filter_criterion = self.filter_utils.get_criterion_for_where_filters(
                    filters=step.filters
                )
                criterion.extend(filter_criterion)
            parameters[f"event{i}"] = step.event

            if segment_filter_query:
                criterion.extend(
                    [
                        self.table.user_id.isin(AliasedQuery("segment_users"))
                        if inclusion_criterion
                        else self.table.user_id.notin(AliasedQuery("segment_users"))
                    ]
                )

            sub_query = (
                ClickHouseQuery.from_(self.table)
                .select(
                    self.table.user_id,
                    fn.Min(self.table.timestamp).as_("ts"),
                )
                .where(Criterion.all(criterion))
                .groupby(1)
                .having(Criterion.all(date_criterion))
            )

            query = query.with_(sub_query, f"table{i + 1}")

        return query, parameters

    def build_users_query(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        start_date: Union[str, None],
        end_date: Union[str, None],
        conversion_time: int,
        random_sequence: Union[bool, None],
        segment_filter_query: Union[ClickHouseQuery, None],
        inclusion_criterion: Union[bool, None],
    ):

        query, parameters = self._builder(
            ds_id=ds_id,
            steps=steps,
            start_date=start_date,
            end_date=end_date,
            random_sequence=random_sequence,
            segment_filter_query=segment_filter_query,
            inclusion_criterion=inclusion_criterion,
        )
        query = query.from_(AliasedQuery("table1"))

        for i in range(1, len(steps)):
            query = query.left_join(AliasedQuery(f"table{i + 1}")).on(
                AliasedQuery(f"table{i}").user_id == AliasedQuery(f"table{i+1}").user_id
            )

        query = query.select(fn.Count(AliasedQuery("table1").user_id).distinct())

        parameters["conversion_time"] = conversion_time
        for i in range(1, len(steps)):
            conditions = [
                Extract(DatePart.year, AliasedQuery(f"table{i+1}").ts)
                > Parameter("%(epoch_year)s"),
                (
                    self.convert_to_unix_timestamp_func(
                        AliasedQuery(f"table{i + 1}").ts
                    )
                    - self.convert_to_unix_timestamp_func(AliasedQuery("table1").ts)
                )
                <= Parameter("%(conversion_time)s"),
            ]
            if random_sequence:
                conditions.append(
                    AliasedQuery(f"table{i+1}").ts > AliasedQuery(f"table1").ts
                )
            else:
                for j in range(i, 0, -1):
                    conditions.append(
                        AliasedQuery(f"table{j + 1}").ts > AliasedQuery(f"table{j}").ts
                    )
            query = query.select(
                fn.Count(
                    Case()
                    .when(
                        Criterion.all(conditions),
                        AliasedQuery(f"table{i + 1}").user_id,
                    )
                    .else_(NULL),
                )
            )

        return query.get_sql(), parameters

    def build_trends_query(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        start_date: Union[str, None],
        end_date: Union[str, None],
        conversion_time: int,
        random_sequence: Union[bool, None],
        segment_filter_query: Union[ClickHouseQuery, None],
        inclusion_criterion: Union[bool, None],
    ):
        query, parameters = self._builder(
            ds_id=ds_id,
            steps=steps,
            start_date=start_date,
            end_date=end_date,
            random_sequence=random_sequence,
            segment_filter_query=segment_filter_query,
            inclusion_criterion=inclusion_criterion,
        )
        query = query.from_(AliasedQuery("table1"))
        parameters["conversion_time"] = conversion_time
        conditions = [
            Extract(DatePart.year, AliasedQuery(f"table{len(steps) - 1}").ts)
            > Parameter("%(epoch_year)s"),
            (
                self.convert_to_unix_timestamp_func(
                    AliasedQuery(f"table{len(steps)}").ts
                )
                - self.convert_to_unix_timestamp_func(AliasedQuery("table1").ts)
            )
            <= Parameter("%(conversion_time)s"),
        ]

        for i in range(1, len(steps)):
            query = query.left_join(AliasedQuery(f"table{i + 1}")).on_field("user_id")
            conditions.append(
                AliasedQuery(f"table{i + 1}").ts >= AliasedQuery(f"table{i}").ts
            )

        query = query.select(
            self.week_func(AliasedQuery("table1").ts),
            Extract(DatePart.year, AliasedQuery("table1").ts),
        )

        query = (
            query.select(
                fn.Count(
                    Case()
                    .when(
                        Criterion.all(conditions),
                        AliasedQuery(f"table{len(steps)}").user_id,
                    )
                    .else_(NULL),
                ),
                fn.Count(AliasedQuery("table1").user_id).distinct(),
            )
            .groupby(1, 2)
            .orderby(2, 1)
        )

        return query.get_sql(), parameters

    def _build_subquery(
        self, steps: List[FunnelStep], random_sequence: Union[bool, None]
    ):
        sub_query = ClickHouseQuery
        sub_query = sub_query.select(AliasedQuery("table1").user_id.as_(0))

        for i in range(1, len(steps)):
            conditions = [
                Extract(DatePart.year, AliasedQuery(f"table{i+1}").ts)
                > Parameter("%(epoch_year)s"),
                (
                    self.convert_to_unix_timestamp_func(
                        AliasedQuery(f"table{i + 1}").ts
                    )
                    - self.convert_to_unix_timestamp_func(AliasedQuery("table1").ts)
                )
                <= Parameter("%(conversion_time)s"),
            ]
            if random_sequence:
                conditions.append(
                    AliasedQuery(f"table{i+1}").ts > AliasedQuery(f"table1").ts
                )
            else:
                for j in range(i, 0, -1):
                    conditions.append(
                        AliasedQuery(f"table{j + 1}").ts > AliasedQuery(f"table{j}").ts
                    )
            sub_query = sub_query.select(
                Case()
                .when(
                    Criterion.all(conditions),
                    AliasedQuery(f"table{i + 1}").user_id,
                )
                .else_(NULL)
                .as_(i)
            )

        sub_query = sub_query.from_(AliasedQuery("table1"))
        for i in range(1, len(steps)):
            sub_query = sub_query.left_join(AliasedQuery(f"table{i + 1}")).on_field(
                "user_id"
            )
        return sub_query

    def build_conversion_count_query(self, second_last, condition: List):
        return (
            ClickHouseQuery.from_(AliasedQuery("final_table"))
            .select(
                fn.Count(Field(second_last)),
                fn.Count(Field(second_last)).distinct(),
            )
            .where(Criterion.all(condition))
        )

    def build_analytics_query(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        status: ConversionStatus,
        start_date: Union[str, None],
        end_date: Union[str, None],
        conversion_time: int,
        random_sequence: Union[bool, None],
        segment_filter_query: Union[ClickHouseQuery, None],
        inclusion_criterion: Union[bool, None],
    ):

        query, parameters = self._builder(
            ds_id=ds_id,
            steps=steps,
            start_date=start_date,
            end_date=end_date,
            random_sequence=random_sequence,
            segment_filter_query=segment_filter_query,
            inclusion_criterion=inclusion_criterion,
        )

        parameters["conversion_time"] = conversion_time
        sub_query = self._build_subquery(steps=steps, random_sequence=random_sequence)

        query = query.with_(sub_query, "final_table")
        query = query.from_(AliasedQuery("final_table"))

        last = len(steps) - 1
        second_last = len(steps) - 2

        selection_condition = [
            Field(last).isnull()
            if status == ConversionStatus.DROPPED
            else Field(last).notnull()
        ]
        count_query = self.build_conversion_count_query(
            second_last, selection_condition
        )
        selection_condition.append(Field(second_last).notnull())
        query = (
            query.select(Field(second_last), count_query)
            .where(Criterion.all(selection_condition))
            .limit(100)
        )

        return query.get_sql(), parameters
