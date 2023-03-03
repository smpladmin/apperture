import datetime
import logging
import re
from typing import Any, Dict, List, Tuple, cast

from pypika import ClickHouseQuery, Criterion, Field, Parameter
from pypika import functions as fn
from pypika import terms

from domain.actions.models import (
    Action,
    ActionGroup,
    CaptureEvent,
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

    def filter_click_event(
        self, filter: ActionGroup, prepend: str = ""
    ) -> Tuple[List, Dict]:
        params = {}
        conditions = []
        operator = "exact"
        if filter.selector is not None:
            selectors = (
                filter.selector
                if isinstance(filter.selector, list)
                else [filter.selector]
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

        if filter.url:
            params[f"{prepend}_url"] = f"{filter.url}"
            if filter.url_matching is UrlMatching.CONTAINS:
                params[f"{prepend}_url"] = f"%{filter.url}%"
                conditions.append(
                    Field(f"properties.$current_url").like(
                        Parameter(f"%({prepend}_url)s")
                    )
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
                    # conditions.append(f"({' OR '.join(combination_conditions)})")
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

        return self.execute_get_query(
            *await self.build_update_events_from_clickstream_query(
                action, update_action_func
            )
        )

    async def build_update_events_from_clickstream_query(
        self, action: Action, update_action_func
    ):

        conditions, params = [], {}
        for index, group in enumerate(action.groups):
            group_condition, group_params = self.filter_click_event(
                filter=group, prepend=f"group_{index}_prepend"
            )
            params = {**params, **group_params}
            if len(group_condition) > 0:
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
        if action.processed_till:
            query = query.where(
                self.click_stream_table.timestamp
                > self.parse_datetime_best_effort(action.processed_till)
            )

        now = datetime.datetime.now()
        await update_action_func(action_id=action.id, processed_till=now)
        logging.info(f"{action.name} processed till: {now}")
        query = query.where(
            self.click_stream_table.timestamp <= self.parse_datetime_best_effort(now)
        )

        query = query.where(Criterion.any(conditions))
        params["ds_id"] = str(action.datasource_id)
        return query.get_sql(), params

    async def get_matching_events_from_clickstream(
        self, datasource_id: str, groups: List[ActionGroup]
    ):
        return self.execute_get_query(
            *await self.build_matching_events_from_clickstream_query(
                datasource_id=datasource_id, groups=groups
            )
        )

    async def build_matching_events_from_clickstream_query(
        self, datasource_id: str, groups: List[ActionGroup]
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

        query = (
            ClickHouseQuery.from_(self.click_stream_table)
            .select(
                self.click_stream_table.event,
                self.click_stream_table.user_id,
                self.click_stream_table.properties,
                self.click_stream_table.timestamp,
            )
            .where(self.click_stream_table.datasource_id == Parameter("%(ds_id)s"))
        )
        query = query.where(Criterion.any(conditions)).limit(100)
        params["ds_id"] = str(datasource_id)
        return query.get_sql(), params

    async def get_count_of_matching_event_from_clickstream(
        self,
        datasource_id: str,
        groups: List[ActionGroup],
    ):
        return self.execute_get_query(
            *await self.build_count_matching_events_from_clickstream_query(
                datasource_id=datasource_id, groups=groups
            )
        )

    async def build_count_matching_events_from_clickstream_query(
        self, datasource_id: str, groups: List[ActionGroup]
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

        query = (
            ClickHouseQuery.from_(self.click_stream_table)
            .select(fn.Count("*"))
            .where(self.click_stream_table.datasource_id == Parameter("%(ds_id)s"))
        )
        query = query.where(Criterion.any(conditions))
        params["ds_id"] = str(datasource_id)
        return query.get_sql(), params
