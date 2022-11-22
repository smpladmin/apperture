import logging
from pypika import (
    Table,
    ClickHouseQuery,
    Criterion,
    AliasedQuery,
    Case,
    NULL,
    DatePart,
    Parameter,
    CustomFunction,
)
from pypika import functions as fn
from pypika.functions import Extract
from fastapi import Depends
from typing import List, Tuple, Dict

from clickhouse import Clickhouse
from domain.funnels.models import FunnelStep


class Funnels:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = "events"
        self.epoch_year = 1970

    def execute_get_query(self, query: str, parameters: Dict):
        logging.info(f"Executing query: {query}")
        query_result = self.clickhouse.client.query(query=query, parameters=parameters)
        return query_result.result_set

    def get_conversion_trend(self, ds_id: str, steps: List[FunnelStep]) -> List[Tuple]:
        return self.execute_get_query(*self.build_trends_query(ds_id, steps))

    def get_users_count(self, ds_id: str, steps: List[FunnelStep]) -> List[Tuple]:
        return self.execute_get_query(*self.build_users_query(ds_id, steps))

    def build_users_query(self, ds_id: str, steps: List[FunnelStep]):
        query = ClickHouseQuery
        events = Table(self.table)
        parameters = {"ds_id": ds_id, "epoch_year": self.epoch_year}

        for i, step in enumerate(steps):
            parameters[f"event{i}"] = step.event
            sub_query = (
                ClickHouseQuery.from_(events)
                .select(
                    events.user_id,
                    fn.Min(events.timestamp).as_("ts"),
                )
                .where(
                    Criterion.all(
                        [
                            events.datasource_id == Parameter("%(ds_id)s"),
                            events.event_name == Parameter(f"%(event{i})s"),
                        ]
                    )
                )
                .groupby(1)
            )
            query = query.with_(sub_query, f"table{i + 1}")

        query = query.from_(AliasedQuery("table1"))
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
        query = ClickHouseQuery
        events = Table(self.table)
        parameters = {"ds_id": ds_id, "epoch_year": self.epoch_year}
        week_func = CustomFunction("WEEK", ["timestamp"])

        for i, step in enumerate(steps):
            parameters[f"event{i}"] = step.event
            sub_query = (
                ClickHouseQuery.from_(events)
                .select(
                    events.user_id,
                    fn.Min(events.timestamp).as_("ts"),
                )
                .where(
                    Criterion.all(
                        [
                            events.datasource_id == Parameter("%(ds_id)s"),
                            events.event_name == Parameter(f"%(event{i})s"),
                        ]
                    )
                )
                .groupby(1)
            )
            query = query.with_(sub_query, f"table{i + 1}")

        query = query.from_(AliasedQuery("table1"))
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
            week_func(AliasedQuery("table1").ts),
            Extract(DatePart.year, AliasedQuery("table1").ts),
        )
        query = query.select(
            fn.Count(
                Case()
                .when(
                    Criterion.all(conditions),
                    AliasedQuery(f"table{len(steps)}").user_id,
                )
                .else_(NULL),
            )
            / fn.Count(AliasedQuery("table1").user_id).distinct()
        ).groupby(1, 2)

        return query.get_sql(), parameters
