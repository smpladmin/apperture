from pypika import (
    ClickHouseQuery,
    Criterion,
    AliasedQuery,
    Case,
    NULL,
    DatePart,
    Parameter,
    Field,
    Order,
)
from pypika import functions as fn
from pypika.functions import Extract
from typing import List, Tuple

from domain.funnels.models import FunnelStep, ConversionStatus
from repositories.clickhouse.base import EventsBase


class Funnels(EventsBase):
    def get_conversion_trend(self, ds_id: str, steps: List[FunnelStep]) -> List[Tuple]:
        return self.execute_get_query(*self.build_trends_query(ds_id, steps))

    def get_conversion_analytics(self, ds_id: str, steps: List[FunnelStep]):
        if len(steps) == 1:
            query = ClickHouseQuery.from_(self.table).where(
                Criterion.all(
                    [
                        self.table.datasource_id == Parameter("%(ds_id)s"),
                        self.table.event_name == Parameter(f"%(event0)s"),
                    ]
                )
            )
            parameter = {
                "ds_id": ds_id,
                "epoch_year": self.epoch_year,
                "event0": steps[0].event,
            }
            result = self.execute_get_query(
                query.select(self.table.user_id).get_sql(), parameter
            )
            count = self.execute_get_query(
                query.select(
                    fn.Count(self.table.user_id),
                    fn.Count(self.table.user_id).distinct(),
                ).get_sql(),
                parameter,
            )
            return [(data[0], ConversionStatus.CONVERTED) for data in result], [
                (ConversionStatus.CONVERTED, count[0][0], count[0][1]),
                (ConversionStatus.DROPPED, 0, 0),
            ]
        query, parameter, last, second_last = self.build_analytics_query(ds_id, steps)
        count_query = (
            ClickHouseQuery.with_(query, "user_list")
            .from_(AliasedQuery("user_list"))
            .select(
                Field(last),
                fn.Count(Field(second_last)),
                fn.Count(Field(second_last)).distinct(),
            )
            .groupby(Field(last))
            .orderby(Field(last), order=Order.desc)
        )

        return self.execute_get_query(
            query.get_sql(), parameter
        ), self.execute_get_query(count_query.get_sql(), parameter)

    def get_users_count(self, ds_id: str, steps: List[FunnelStep]) -> List[Tuple]:
        return self.execute_get_query(*self.build_users_query(ds_id, steps))

    def _builder(self, ds_id: str, steps: List[FunnelStep]):
        query = ClickHouseQuery
        parameters = {"ds_id": ds_id, "epoch_year": self.epoch_year}

        for i, step in enumerate(steps):
            parameters[f"event{i}"] = step.event
            sub_query = (
                ClickHouseQuery.from_(self.table)
                .select(
                    self.table.user_id,
                    fn.Min(self.table.timestamp).as_("ts"),
                )
                .where(
                    Criterion.all(
                        [
                            self.table.datasource_id == Parameter("%(ds_id)s"),
                            self.table.event_name == Parameter(f"%(event{i})s"),
                        ]
                    )
                )
                .groupby(1)
            )
            query = query.with_(sub_query, f"table{i + 1}")

        query = query.from_(AliasedQuery("table1"))
        return query, parameters

    def build_users_query(self, ds_id: str, steps: List[FunnelStep]):
        query, parameters = self._builder(ds_id=ds_id, steps=steps)
        for i in range(1, len(steps)):
            query = query.left_join(AliasedQuery(f"table{i + 1}")).on_field("user_id")

        query = query.select(fn.Count(AliasedQuery("table1").user_id).distinct())
        for i in range(1, len(steps)):
            conditions = [
                Extract(DatePart.year, AliasedQuery(f"table{i}").ts)
                > Parameter("%(epoch_year)s")
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

    def build_trends_query(self, ds_id: str, steps: List[FunnelStep]):
        query, parameters = self._builder(ds_id=ds_id, steps=steps)
        conditions = [
            Extract(DatePart.year, AliasedQuery(f"table{len(steps) - 1}").ts)
            > Parameter("%(epoch_year)s")
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

    def build_analytics_query(self, ds_id: str, steps: List[FunnelStep]):
        query = ClickHouseQuery
        parameters = {"ds_id": ds_id, "epoch_year": self.epoch_year}

        for i, step in enumerate(steps):
            parameters[f"event{i}"] = step.event
            sub_query = (
                ClickHouseQuery.from_(self.table)
                .select(
                    self.table.user_id,
                    fn.Min(self.table.timestamp).as_("ts"),
                )
                .where(
                    Criterion.all(
                        [
                            self.table.datasource_id == Parameter("%(ds_id)s"),
                            self.table.event_name == Parameter(f"%(event{i})s"),
                        ]
                    )
                )
                .groupby(1)
            )
            query = query.with_(sub_query, f"table{i + 1}")

        sub_query = ClickHouseQuery
        sub_query = sub_query.select(AliasedQuery("table1").user_id.as_(0))

        for i in range(1, len(steps)):
            conditions = [
                Extract(DatePart.year, AliasedQuery(f"table{i}").ts)
                > Parameter("%(epoch_year)s")
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

        query = query.with_(sub_query, "final_table")
        query = query.from_(AliasedQuery("final_table"))

        last = len(steps) - 1
        second_last = len(steps) - 2
        query = (
            query.select(
                Field(second_last),
                Case()
                .when(Field(last) != "null", ConversionStatus.CONVERTED)
                .else_(ConversionStatus.DROPPED)
                .as_(last),
            )
            .where(Field(second_last) != "null")
            .orderby(last)
        )

        return query, parameters, last, second_last
