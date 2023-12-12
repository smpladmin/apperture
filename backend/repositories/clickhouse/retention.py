from typing import Union, List, Tuple
from fastapi import Depends
from pypika import ClickHouseQuery, functions as fn, AliasedQuery
from pypika.terms import ContainsCriterion, Interval, Parameter, Criterion

from clickhouse import Clickhouse
from domain.retention.models import EventSelection, Granularity
from repositories.clickhouse.base import EventsBase
from repositories.clickhouse.utils.filters import Filters


class Retention(EventsBase):
    def __init__(
        self, clickhouse: Clickhouse = Depends(), filter_utils: Filters = Depends()
    ):
        super().__init__(clickhouse=clickhouse)
        self.filter_utils = filter_utils

    async def compute_retention(
        self,
        datasource_id: str,
        app_id: str,
        start_event: EventSelection,
        goal_event: EventSelection,
        start_date: str,
        end_date: str,
        segment_filter_criterion: Union[ContainsCriterion, None],
        granularity: Granularity,
    ) -> List[Tuple]:
        parameters = {
            "ds_id": datasource_id,
            "start_event": start_event.event,
            "goal_event": goal_event.event,
            "start_date": start_date,
            "end_date": end_date,
            "epoch_year": self.epoch_year,
        }
        return await self.execute_query_for_app(
            app_id=app_id,
            query=self.build_retention_query(
                segment_filter_criterion=segment_filter_criterion,
                granularity=granularity,
                start_event=start_event,
                goal_event=goal_event,
            ),
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

        conditions.append(
            self.table.event_name == Parameter(f"%(start_event)s")
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

    def build_retention_query(
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

        initial_count_query = (
            ClickHouseQuery.select(
                AliasedQuery("start_event_sub_query").granularity, fn.Count("*")
            )
            .from_(AliasedQuery("start_event_sub_query"))
            .groupby(1)
            .orderby(1)
        )

        retention_count_query = (
            ClickHouseQuery.select(
                AliasedQuery("start_event_sub_query").granularity,
                self.date_diff_func(
                    granularity.value[:-1],
                    AliasedQuery("start_event_sub_query").granularity,
                    AliasedQuery("goal_event_sub_query").granularity,
                ),
                fn.Count("*"),
            )
            .from_(AliasedQuery("start_event_sub_query"))
            .inner_join(AliasedQuery("goal_event_sub_query"))
            .on_field("user_id")
            .where(
                AliasedQuery("goal_event_sub_query").ts
                > AliasedQuery("start_event_sub_query").ts
            )
            .groupby(1, 2)
            .orderby(2, 1)
        )

        query = query.with_(initial_count_query, "initial_count_query").with_(
            retention_count_query, "retention_count_query"
        )

        query = (
            (
                query.from_(AliasedQuery("retention_count_query")).left_join(
                    AliasedQuery("initial_count_query")
                )
            )
            .on_field("granularity")
            .select("*")
        )

        return query.get_sql()
