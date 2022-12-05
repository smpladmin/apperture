from pypika import (
    ClickHouseQuery,
    Criterion,
    AliasedQuery,
    Case,
    NULL,
    DatePart,
    Parameter,
)
from pypika import functions as fn
from pypika.functions import Extract
from typing import List, Tuple

from domain.funnels.models import FunnelStep
from repositories.clickhouse.events import Events


class Funnels(Events):
    def get_conversion_trend(self, ds_id: str, steps: List[FunnelStep]) -> List[Tuple]:
        return self.execute_get_query(*self.build_trends_query(ds_id, steps))

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
