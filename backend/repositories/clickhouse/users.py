from .base import EventsBase
from typing import Union
from pypika import ClickHouseQuery, Criterion, Parameter, Order


class User(EventsBase):
    def get_user_properties(
        self, user_id: str, datasource_id: str, event: Union[str, None]
    ):
        return self.execute_get_query(
            *self.build_get_user_properties_query(user_id, datasource_id, event)
        )

    def build_get_user_properties_query(
        self, user_id: str, datasource_id: str, event: Union[str, None]
    ):
        query = (
            ClickHouseQuery.from_(self.table)
            .select(
                self.json_extract_raw_func(
                    self.to_json_string_func(self.table.properties)
                )
            )
            .orderby(self.table.timestamp, order=Order.desc)
        )
        parameter = {"ds_id": datasource_id, "user_id": user_id}
        conditions = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            self.table.user_id == Parameter("%(user_id)s"),
        ]
        if event:
            parameter["event"] = event
            conditions.append(self.table.event_name == Parameter("%(event)s"))
        query = query.where(Criterion.all(conditions)).limit(1)
        return query.get_sql(), parameter
