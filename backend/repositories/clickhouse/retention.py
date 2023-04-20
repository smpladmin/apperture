import math
from typing import Union, List, Tuple

from fastapi import Depends
from pypika import ClickHouseQuery, functions as fn, Table, AliasedQuery
from pypika.terms import ContainsCriterion, Interval, Parameter, Criterion, Field

from clickhouse import Clickhouse
from domain.retention.models import EventSelection, Granularity
from repositories.clickhouse.base import EventsBase


class Retention(EventsBase):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        super().__init__(clickhouse=clickhouse)

    def compute_retention_trend(
        self,
        datasource_id: str,
        start_event: EventSelection,
        goal_event: EventSelection,
        start_date: str,
        end_date: str,
        segment_filter_criterion: Union[ContainsCriterion, None],
        granularity: Granularity,
        interval: int,
    ) -> List[Tuple]:
        return self.execute_get_query(
            *self.build_retention_trend_query(
                datasource_id=datasource_id,
                start_event=start_event,
                goal_event=goal_event,
                start_date=start_date,
                end_date=end_date,
                segment_filter_criterion=segment_filter_criterion,
                granularity=granularity,
                interval=interval,
            )
        )

    def build_initial_count_query(self, granularity: Granularity):
        conditions = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            self.table.event_name == Parameter(f"%(start_event)s"),
            self.date_func(self.table.timestamp) >= Parameter(f"%(start_date)s"),
            self.date_func(self.table.timestamp) <= Parameter(f"%(end_date)s"),
        ]
        initial_count_query = (
            ClickHouseQuery.from_(self.table)
            .select(
                self.to_start_of_interval_func(
                    self.table.timestamp, Interval(**{granularity.value: 1})
                ).as_("granularity"),
                fn.Count(self.table.user_id).distinct().as_("count"),
            )
            .where(Criterion.all(conditions))
            .groupby(Field("granularity"))
        )

        return initial_count_query

    def build_retention_count_query(self, granularity: Granularity):
        events1 = Table("events")
        events2 = Table("events")

        retention_count_conditions = [
            events2.timestamp > self.table.timestamp,
            (
                events2.timestamp.between(
                    self.to_start_of_interval_func(
                        self.table.timestamp + Parameter(f"%(interval0)s"),
                        Interval(**{granularity.value: 1}),
                    ),
                    self.to_start_of_interval_func(
                        self.table.timestamp + Parameter(f"%(interval1)s"),
                        Interval(**{granularity.value: 1}),
                    )
                    - Interval(seconds=1),
                )
            ),
            self.date_func(events2.timestamp) <= Parameter(f"%(end_date)s"),
        ]
        retention_count_query = (
            ClickHouseQuery.from_(events1)
            .inner_join(events2)
            .on(
                (events1.user_id == events2.user_id)
                & (events2.event_name == Parameter(f"%(goal_event)s"))
                & (events1.event_name == Parameter(f"%(start_event)s"))
                & (events1.datasource_id == Parameter("%(ds_id)s"))
            )
            .select(
                self.to_start_of_interval_func(
                    events1.timestamp, Interval(**{granularity.value: 1})
                ).as_("granularity"),
                fn.Count(events1.user_id).distinct().as_("count"),
            )
            .where(Criterion.all(retention_count_conditions))
            .groupby(Field("granularity"))
        )

        return retention_count_query

    def build_retention_trend_query(
        self,
        datasource_id: str,
        start_event: EventSelection,
        goal_event: EventSelection,
        start_date: str,
        end_date: str,
        segment_filter_criterion: Union[ContainsCriterion, None],
        granularity: Granularity,
        interval: int,
    ):
        parameters = {
            "ds_id": datasource_id,
            "start_event": start_event.event,
            "goal_event": goal_event.event,
            "start_date": start_date,
            "end_date": end_date,
            "interval0": Interval(**{granularity.value: interval}),
            "interval1": Interval(**{granularity.value: interval + 1}),
        }

        initial_count_query = self.build_initial_count_query(granularity=granularity)
        retention_count_query = self.build_retention_count_query(
            granularity=granularity
        )

        query = ClickHouseQuery.with_(initial_count_query, "initial_count").with_(
            retention_count_query, "retention_count"
        )
        query = (
            query.from_(AliasedQuery("initial_count"))
            .inner_join(AliasedQuery("retention_count"))
            .on_field("granularity")
            .select(
                AliasedQuery("initial_count").granularity,
                AliasedQuery("retention_count").count
                / AliasedQuery("initial_count").count,
                AliasedQuery("retention_count").count,
            )
            .orderby(Field("granularity"))
        )

        return query.get_sql(), parameters

    def compute_retention(
        self,
        datasource_id: str,
        start_event: EventSelection,
        goal_event: EventSelection,
        start_date: str,
        end_date: str,
        segment_filter_criterion: Union[ContainsCriterion, None],
        granularity: Granularity,
        start_index: int,
        end_index: int,
    ):
        retention_query = self.build_retention_query(granularity=granularity)
        parameters = {
            "ds_id": datasource_id,
            "start_event": start_event.event,
            "goal_event": goal_event.event,
            "start_date": start_date,
            "end_date": end_date,
        }
        results = []
        for interval in range(start_index, end_index):
            parameters["interval0"] = Interval(**{granularity.value: interval})
            parameters["interval1"] = Interval(**{granularity.value: interval + 1})
            result = self.execute_get_query(
                query=retention_query, parameters=parameters
            )[0][0]
            result = 0 if math.isnan(result) else result
            results.append("{:.2f}".format(result * 100))
        return results

    def build_retention_query(
        self,
        granularity: Granularity,
    ):

        initial_count_query = self.build_initial_count_query(granularity=granularity)
        retention_count_query = self.build_retention_count_query(
            granularity=granularity
        )

        query = ClickHouseQuery.with_(initial_count_query, "initial_count").with_(
            retention_count_query, "retention_count"
        )
        query = (
            query.from_(AliasedQuery("initial_count"))
            .inner_join(AliasedQuery("retention_count"))
            .on_field("granularity")
            .select(
                fn.Sum(AliasedQuery("retention_count").count)
                / fn.Sum(AliasedQuery("initial_count").count),
            )
        )

        return query.get_sql()
