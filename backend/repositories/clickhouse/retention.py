import math
from typing import Union, List, Tuple

from fastapi import Depends
from pypika import ClickHouseQuery, functions as fn, AliasedQuery, DatePart, NULL
from pypika.functions import Extract
from pypika.terms import ContainsCriterion, Interval, Parameter, Criterion, Field, Case

from clickhouse import Clickhouse
from domain.retention.models import EventSelection, Granularity
from repositories.clickhouse.base import EventsBase
from repositories.clickhouse.utils.filters import Filters


class Retention(EventsBase):
    def __init__(self, clickhouse: Clickhouse = Depends(), filter_utils: Filters = Depends()):
        super().__init__(clickhouse=clickhouse)
        self.filter_utils = filter_utils

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
        parameters = {
            "ds_id": datasource_id,
            "start_event": start_event.event,
            "goal_event": goal_event.event,
            "start_date": start_date,
            "end_date": end_date,
            "interval": Interval(**{granularity.value: interval}),
            "epoch_year": self.epoch_year,
        }
        return self.execute_get_query(
            query=self.build_retention_trend_query(
                segment_filter_criterion=segment_filter_criterion,
                granularity=granularity,
                start_event=start_event,
                goal_event=goal_event,
            ).get_sql(),
            parameters=parameters,
        )

    def build_sub_query(
        self,
        granularity: Granularity,
        event_flag: bool,
        event: EventSelection,
        segment_filter_criterion: Union[ContainsCriterion, None],
    ):

        conditions = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            self.date_func(self.table.timestamp) >= Parameter(f"%(start_date)s"),
            self.date_func(self.table.timestamp) <= Parameter(f"%(end_date)s"),
        ]

        conditions.extend(
            [
                self.table.event_name == Parameter(f"%(start_event)s"),
                Field("granularity")
                <= self.to_start_of_interval_func(
                    fn.Now(), Interval(**{granularity.value: 1})
                )
                - Parameter(f"%(interval)s"),
            ]
        ) if event_flag else conditions.append(
            self.table.event_name == Parameter(f"%(goal_event)s")
        )

        if segment_filter_criterion:
            conditions.append(segment_filter_criterion)

        if event.filters:
            filter_criterion = self.filter_utils.get_criterion_for_where_filters(
                filters=event.filters
            )
            conditions.extend(filter_criterion)

        sub_query = ClickHouseQuery.from_(self.table).select(
            self.table.user_id,
            self.to_start_of_interval_func(
                self.table.timestamp, Interval(**{granularity.value: 1})
            ).as_("granularity"),
        )

        sub_query = (
            sub_query.select(fn.Min(self.table.timestamp).as_("ts"))
            if event_flag
            else sub_query.select(fn.Max(self.table.timestamp).as_("ts"))
        )
        sub_query = sub_query.where(Criterion.all(conditions)).groupby(1, 2)

        return sub_query

    def build_retention_trend_query(
        self,
        start_event: EventSelection,
        goal_event: EventSelection,
        segment_filter_criterion: Union[ContainsCriterion, None],
        granularity: Granularity,
    ):
        start_event_sub_query = self.build_sub_query(
            granularity=granularity,
            event_flag=True,
            event=start_event,
            segment_filter_criterion=segment_filter_criterion,
        )
        goal_event_sub_query = self.build_sub_query(
            granularity=granularity,
            event_flag=False,
            event=goal_event,
            segment_filter_criterion=segment_filter_criterion,
        )

        query = ClickHouseQuery.with_(
            start_event_sub_query, "start_event_sub_query"
        ).with_(goal_event_sub_query, "goal_event_sub_query")

        conditions = [
            Extract(DatePart.year, AliasedQuery("goal_event_sub_query").ts)
            > Parameter("%(epoch_year)s"),
            AliasedQuery("goal_event_sub_query").ts
            > AliasedQuery("start_event_sub_query").ts,
        ]

        query = (
            query.from_(AliasedQuery("start_event_sub_query"))
            .left_join(AliasedQuery("goal_event_sub_query"))
            .on(
                (
                    AliasedQuery("start_event_sub_query").user_id
                    == AliasedQuery("goal_event_sub_query").user_id
                )
                & (
                    AliasedQuery("start_event_sub_query").granularity
                    + Parameter(f"%(interval)s")
                    == AliasedQuery("goal_event_sub_query").granularity
                )
            )
            .select(
                AliasedQuery("start_event_sub_query").granularity,
                fn.Count(AliasedQuery("start_event_sub_query").user_id)
                .distinct()
                .as_("total_count"),
                fn.Count(
                    Case()
                    .when(
                        Criterion.all(conditions),
                        AliasedQuery("goal_event_sub_query").user_id,
                    )
                    .else_(NULL),
                ).as_("retention_count"),
            )
            .groupby(Field("granularity"))
            .orderby(Field("granularity"))
        )

        return query

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

        retention_query = self.build_retention_query(
            granularity=granularity,
            segment_filter_criterion=segment_filter_criterion,
            start_event=start_event,
            goal_event=goal_event,
        )

        parameters = {
            "ds_id": datasource_id,
            "start_event": start_event.event,
            "goal_event": goal_event.event,
            "start_date": start_date,
            "end_date": end_date,
            "epoch_year": self.epoch_year,
        }

        results = []
        for interval in range(start_index, end_index):
            parameters["interval"] = Interval(**{granularity.value: interval})
            result = self.execute_get_query(
                query=retention_query, parameters=parameters
            )[0][0]
            result = 0 if math.isnan(result) else result
            results.append("{:.2f}".format(result * 100))

        return results

    def build_retention_query(
        self,
        start_event: EventSelection,
        goal_event: EventSelection,
        segment_filter_criterion: Union[ContainsCriterion, None],
        granularity: Granularity,
    ):
        sub_query = self.build_retention_trend_query(
            segment_filter_criterion=segment_filter_criterion,
            granularity=granularity,
            start_event=start_event,
            goal_event=goal_event,
        )
        query = ClickHouseQuery.from_(sub_query).select(
            fn.Sum(Field("retention_count")) / fn.Sum(Field("total_count"))
        )
        return query.get_sql()
