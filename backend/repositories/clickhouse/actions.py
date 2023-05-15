from datetime import datetime, timedelta
import logging
import re
import os
from typing import Any, Dict, List, Tuple, Union, cast

from beanie import PydanticObjectId
from pypika import ClickHouseQuery, Criterion, Field, Parameter, Order
from pypika import functions as fn
from pypika import terms

from domain.actions.models import (
    Action,
    ActionGroup,
    OperatorType,
    UrlMatching,
)
from repositories.clickhouse.base import EventsBase
from repositories.clickhouse.parser.action_parser_utils import Selector


class Actions(EventsBase):
    def build_selector_regex(self, selector: Selector) -> str:
        regex = r""
        for tag in selector.parts:
            if tag.data.get("tag_name") and isinstance(tag.data["tag_name"], str):
                if tag.data["tag_name"] == "*":
                    regex += ".+"
                else:
                    regex += tag.data["tag_name"]
            if tag.data.get("attr_class__contains"):
                regex += r".*?\.{}".format(
                    r"\..*?".join(sorted(tag.data["attr_class__contains"]))
                )
            if tag.ch_attributes:
                regex += ".*?"
                for key, value in sorted(tag.ch_attributes.items()):
                    regex += '{}="{}".*?'.format(key, value)
            regex += r'([-_a-zA-Z0-9\.:"= ]*?)?($|;|:([^;^\s]*(;|$|\s)))'
            if tag.direct_descendant:
                regex += ".*"
        return regex

    def process_selector_condition(self, filter: ActionGroup, prepend: str):
        params = {}
        conditions = []
        selectors = (
            filter.selector if isinstance(filter.selector, list) else [filter.selector]
        )

        for idx, query in enumerate(selectors):
            if not query:  # Skip empty selectors
                continue
            selector = Selector(query, escape_slashes=False)
            key = f"{prepend}_{idx}_selector_regex"
            params[key] = self.build_selector_regex(selector)
            conditions.append(
                self.ch_match_func(
                    self.click_stream_table.element_chain, Parameter(f"%({key})s")
                )
            )
        return conditions, params

    def process_url_conditions(self, filter: ActionGroup, prepend: str):
        params = {}
        conditions = []
        params[f"{prepend}_url"] = f"{filter.url}"
        if filter.url_matching is UrlMatching.CONTAINS:
            params[f"{prepend}_url"] = f"%{filter.url}%"
            conditions.append(
                Field(f"properties.$current_url").like(Parameter(f"%({prepend}_url)s"))
            )
        elif filter.url_matching is UrlMatching.EXACT:
            conditions.append(
                Field(f"properties.$current_url") == Parameter(f"%({prepend}_url)s")
            )
        elif filter.url_matching is UrlMatching.REGEX:
            conditions.append(
                self.ch_match_func(
                    Field(f"properties.$current_url"),
                    Parameter(f"%({prepend}_url)s"),
                )
            )
        return conditions, params

    def process_text_or_href_conditions(self, filter: ActionGroup, prepend: str):
        params = {}
        conditions = []
        operator = "exact"
        attributes: Dict[str, List] = {}
        if filter.href:
            attributes["href"] = self.process_ok_values(filter.href, operator)
        if filter.text:
            attributes["text"] = self.process_ok_values(filter.text, operator)

        if attributes:
            for key, ok_values in attributes.items():
                if ok_values:
                    combination_conditions = []
                    for idx, value in enumerate(ok_values):
                        optional_flag = "(?i)" if operator.endswith("icontains") else ""
                        params[
                            f"{prepend}_{key}_{idx}_attributes_regex"
                        ] = f'{optional_flag}({key}="{value}")'
                        conditions.append(
                            self.ch_match_func(
                                self.click_stream_table.element_chain,
                                Parameter(
                                    f"%({prepend}_{key}_{idx}_attributes_regex)s"
                                ),
                            )
                        )
        return conditions, params

    def filter_click_event(
        self, filter: ActionGroup, prepend: str = ""
    ) -> Tuple[List, Dict]:
        params = {}
        conditions = []
        if filter.selector is not None:
            filter_conditions, filter_parameters = self.process_selector_condition(
                filter=filter, prepend=prepend
            )
            conditions += filter_conditions
            params = filter_parameters

        if filter.url:
            url_conditions, url_parameters = self.process_url_conditions(
                filter=filter, prepend=prepend
            )
            conditions += url_conditions
            params = {
                **params,
                **url_parameters,
            }

        if filter.href or filter.text:
            (
                transient_conditions,
                transient_params,
            ) = self.process_text_or_href_conditions(filter=filter, prepend=prepend)
            conditions += transient_conditions
            params = {**params, **transient_params}

        return conditions, params

    def process_ok_values(self, ok_values: Any, operator: OperatorType) -> List[str]:
        if operator.endswith("_set"):
            return [r'[^"]+']
        else:
            ok_values = (
                cast(List[str], [str(val) for val in ok_values])
                if isinstance(ok_values, list)
                else [ok_values]
            )
            ok_values = [text.replace('"', r"\"") for text in ok_values]
            if operator.endswith("icontains"):
                return [rf'[^"]*{re.escape(text)}[^"]*' for text in ok_values]
            if operator.endswith("regex"):
                return ok_values
            return [re.escape(text).replace("\\ ", " ") for text in ok_values]

    async def update_events_from_clickstream(self, action: Action, update_action_func):

        try:
            query, params, now = await self.build_update_events_from_clickstream_query(
                action=action
            )
            self.execute_get_query(query=query, parameters=params)
            await update_action_func(action_id=action.id, processed_till=now)
            logging.info(f"{action.name} processed till: {now}")
        except Exception as e:
            logging.info(f"Failed executing query for {action.name} with exception {e}")
        return

    def get_minimum_timestamp_of_events(self, datasource_id: str):
        params = {"ds_id": datasource_id}
        query = (
            ClickHouseQuery.from_(self.click_stream_table)
            .select(
                fn.Min(self.click_stream_table.timestamp),
            )
            .where(self.click_stream_table.datasource_id == Parameter("%(ds_id)s"))
        )
        return self.execute_get_query(query=query.get_sql(), parameters=params)

    def compute_migration_start_and_end_time(self, action: Action):
        date_format = "%Y-%m-%d %H:%M:%S"
        start_time, end_time = action.processed_till, datetime.strptime(
            datetime.now().strftime(date_format), date_format
        )

        if action.processed_till:
            start_time = datetime.strptime(
                start_time.strftime(date_format), date_format
            )

        if not action.processed_till:
            [(start_time,),] = self.get_minimum_timestamp_of_events(
                datasource_id=str(action.datasource_id)
            )

        event_migration_interval = int(os.getenv("EVENT_MIGRATION_INTERVAL", 24))

        current_datetime = datetime.now()
        given_timestamp = datetime.strptime(str(start_time), date_format)

        time_delta = current_datetime - given_timestamp
        if time_delta.total_seconds() / 3600 > event_migration_interval:
            end_time = start_time + timedelta(hours=event_migration_interval)

        return start_time, end_time

    async def build_update_events_from_clickstream_query(self, action: Action):
        conditions, params = [], {}
        for index, group in enumerate(action.groups):
            group_condition, group_params = self.filter_click_event(
                filter=group, prepend=f"group_{index}_prepend"
            )
            params = {**params, **group_params}
            if len(group_condition) > 0:
                group_condition.append(self.click_stream_table.event == group.event)
                conditions.append(Criterion.all(group_condition))

        query = (
            ClickHouseQuery.into(self.table)
            .from_(self.click_stream_table)
            .select(
                self.click_stream_table.datasource_id,
                self.click_stream_table.timestamp,
                terms.Term.wrap_constant("apperture"),
                self.click_stream_table.user_id,
                terms.Term.wrap_constant(action.name),
                self.click_stream_table.properties,
            )
            .where(self.click_stream_table.datasource_id == Parameter("%(ds_id)s"))
        )

        start_time, end_time = self.compute_migration_start_and_end_time(action=action)
        query = query.where(
            Criterion.all(
                [
                    self.click_stream_table.timestamp
                    > self.parse_datetime_best_effort(start_time),
                    self.click_stream_table.timestamp
                    <= self.parse_datetime_best_effort(end_time),
                ]
            )
        )

        query = query.where(Criterion.all(conditions))
        params["ds_id"] = str(action.datasource_id)
        return query.get_sql(), params, end_time

    async def get_matching_events_from_clickstream(
        self,
        datasource_id: str,
        groups: List[ActionGroup],
        start_date: Union[str, None],
        end_date: Union[str, None],
    ):
        return self.execute_get_query(
            *await self.build_matching_events_from_clickstream_query(
                datasource_id=datasource_id,
                groups=groups,
                start_date=start_date,
                end_date=end_date,
            )
        )

    def build_date_filter_criterion(
        self, start_date: Union[str, None], end_date: Union[str, None]
    ):
        date_criterion = []
        if start_date and end_date:
            date_criterion.extend(
                [
                    self.date_func(Field("timestamp")) >= start_date,
                    self.date_func(Field("timestamp")) <= end_date,
                ]
            )
        return date_criterion

    async def build_matching_events_from_clickstream_query(
        self,
        datasource_id: str,
        groups: List[ActionGroup],
        start_date: Union[str, None],
        end_date: Union[str, None],
    ):
        conditions, params = [], {}
        for index, group in enumerate(groups):
            group_condition, group_params = self.filter_click_event(
                filter=group, prepend=f"group_{index}_prepend"
            )
            params = {**params, **group_params}
            if len(group_condition) > 0:
                group_condition.append(self.click_stream_table.event == group.event)
                conditions.append(Criterion.all(group_condition))

        criterion = [self.click_stream_table.datasource_id == Parameter("%(ds_id)s")]
        date_criterion = self.build_date_filter_criterion(
            start_date=start_date, end_date=end_date
        )
        criterion.extend(date_criterion)

        query = (
            ClickHouseQuery.from_(self.click_stream_table)
            .select(
                self.click_stream_table.event,
                self.click_stream_table.user_id,
                self.click_stream_table.properties,
                self.click_stream_table.timestamp,
            )
            .where(Criterion.all(criterion))
            .orderby(4, order=Order.desc)
        )

        query = query.where(Criterion.any(conditions)).limit(100)
        params["ds_id"] = str(datasource_id)
        return query.get_sql(), params

    async def get_count_of_matching_event_from_clickstream(
        self,
        datasource_id: str,
        groups: List[ActionGroup],
        start_date: Union[str, None],
        end_date: Union[str, None],
    ):
        return self.execute_get_query(
            *await self.build_count_matching_events_from_clickstream_query(
                datasource_id=datasource_id,
                groups=groups,
                start_date=start_date,
                end_date=end_date,
            )
        )

    async def build_count_matching_events_from_clickstream_query(
        self,
        datasource_id: str,
        groups: List[ActionGroup],
        start_date: Union[str, None],
        end_date: Union[str, None],
    ):
        conditions, params = [], {}
        for index, group in enumerate(groups):
            group_condition, group_params = self.filter_click_event(
                filter=group, prepend=f"group_{index}_prepend"
            )
            params = {**params, **group_params}
            if len(group_condition) > 0:
                group_condition.append(self.click_stream_table.event == group.event)
                conditions.append(Criterion.all(group_condition))

        criterion = [self.click_stream_table.datasource_id == Parameter("%(ds_id)s")]
        date_criterion = self.build_date_filter_criterion(
            start_date=start_date, end_date=end_date
        )
        criterion.extend(date_criterion)

        query = (
            ClickHouseQuery.from_(self.click_stream_table)
            .select(fn.Count("*"))
            .where(Criterion.all(criterion))
        )

        query = query.where(Criterion.any(conditions))
        params["ds_id"] = str(datasource_id)
        return query.get_sql(), params

    def delete_processed_events(self, ds_id: PydanticObjectId, event: str):
        query = f"DELETE FROM {self.table} WHERE event_name='{event}' AND datasource_id='{ds_id}' SETTINGS allow_experimental_lightweight_delete=1"
        self.execute_get_query(query, {})
