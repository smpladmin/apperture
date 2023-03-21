from pypika import (
    ClickHouseQuery,
    Criterion,
    AliasedQuery,
    Case,
    NULL,
    DatePart,
    Parameter,
    Field,
)
from pypika import functions as fn
from pypika.functions import Extract
from typing import List, Tuple, Union

from domain.funnels.models import FunnelStep, ConversionStatus
from repositories.clickhouse.base import EventsBase


class Funnels(EventsBase):
    def get_conversion_trend(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        start_date: Union[str, None],
        end_date: Union[str, None],
        conversion_time: int,
    ) -> List[Tuple]:
        return self.execute_get_query(
            *self.build_trends_query(
                ds_id=ds_id,
                steps=steps,
                start_date=start_date,
                end_date=end_date,
                conversion_time=conversion_time,
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
    ):
        if len(steps) == 1:
            return self.get_initial_users(
                ds_id=ds_id,
                steps=steps,
                status=status,
                start_date=start_date,
                end_date=end_date,
            )

        query, parameter = self.build_analytics_query(
            ds_id,
            steps,
            status,
            start_date=start_date,
            end_date=end_date,
            conversion_time=conversion_time,
        )
        return self.execute_get_query(query, parameter)

    def get_initial_users(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        status: ConversionStatus,
        start_date: Union[str, None],
        end_date: Union[str, None],
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
        query = ClickHouseQuery.from_(self.table).where(Criterion.all(conditions))
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
    ) -> List[Tuple]:
        return self.execute_get_query(
            *self.build_users_query(
                ds_id=ds_id,
                steps=steps,
                start_date=start_date,
                end_date=end_date,
                conversion_time=conversion_time,
            )
        )

    def _builder(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        start_date: Union[str, None],
        end_date: Union[str, None],
    ):
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
        for i, step in enumerate(steps):
            criterion = [
                self.table.datasource_id == Parameter("%(ds_id)s"),
                self.table.event_name == Parameter(f"%(event{i})s"),
            ]
            if step.filters:
                filter_criterion = self.get_criterion_for_where_filters(
                    filters=step.filters
                )
                criterion.extend(filter_criterion)
            parameters[f"event{i}"] = step.event

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
    ):
        query, parameters = self._builder(
            ds_id=ds_id, steps=steps, start_date=start_date, end_date=end_date
        )
        query = query.from_(AliasedQuery("table1"))

        for i in range(1, len(steps)):
            query = query.left_join(AliasedQuery(f"table{i + 1}")).on_field("user_id")

        query = query.select(fn.Count(AliasedQuery("table1").user_id).distinct())
        parameters["conversion_time"] = conversion_time
        for i in range(1, len(steps)):
            conditions = [
                Extract(DatePart.year, AliasedQuery(f"table{i}").ts)
                > Parameter("%(epoch_year)s"),
                (
                    self.convert_to_unix_timestamp_func(
                        AliasedQuery(f"table{i + 1}").ts
                    )
                    - self.convert_to_unix_timestamp_func(AliasedQuery("table1").ts)
                )
                <= Parameter("%(conversion_time)s"),
            ]
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
    ):
        query, parameters = self._builder(
            ds_id=ds_id, steps=steps, start_date=start_date, end_date=end_date
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

    def _build_subquery(self, steps: List[FunnelStep]):
        sub_query = ClickHouseQuery
        sub_query = sub_query.select(AliasedQuery("table1").user_id.as_(0))

        for i in range(1, len(steps)):
            conditions = [
                Extract(DatePart.year, AliasedQuery(f"table{i}").ts)
                > Parameter("%(epoch_year)s"),
                (
                    self.convert_to_unix_timestamp_func(
                        AliasedQuery(f"table{i + 1}").ts
                    )
                    - self.convert_to_unix_timestamp_func(AliasedQuery("table1").ts)
                )
                <= Parameter("%(conversion_time)s"),
            ]
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
    ):
        query, parameters = self._builder(
            ds_id=ds_id, steps=steps, start_date=start_date, end_date=end_date
        )

        parameters["conversion_time"] = conversion_time
        sub_query = self._build_subquery(steps=steps)

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
