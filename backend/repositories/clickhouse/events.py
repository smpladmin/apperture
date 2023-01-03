from typing import List
from pypika import (
    ClickHouseQuery,
    Parameter,
    functions as fn,
    Criterion,
    Field,
)

from repositories.clickhouse.base import EventsBase


class Events(EventsBase):
    def get_unique_events(self, datasource_id: str):
        query, params = self.build_unique_events_query(datasource_id)
        return self.execute_get_query(query, params)

    def build_unique_events_query(self, datasource_id: str):
        params = {"ds_id": datasource_id}
        query = (
            ClickHouseQuery.from_(self.table)
            .where(self.table.datasource_id == Parameter("%(ds_id)s"))
            .where(self.table.event_name.not_like("%%/%%"))
            .where(self.table.event_name.not_like("%%?%%"))
            .select(self.table.event_name)
            .distinct()
        )
        return query.get_sql(), params

    def get_event_properties(self, datasource_id: str):
        return self.execute_get_query(*self.build_event_properties_query(datasource_id))

    def build_event_properties_query(self, datasource_id: str):
        query = (
            ClickHouseQuery.from_(self.table)
            .select(
                self.json_extract_keys_func(
                    self.to_json_string_func(self.table.properties)
                ),
                self.date_func(self.table.timestamp),
            )
            .where(self.table.datasource_id == Parameter("%(ds_id)s"))
            .limit(1)
        )
        return query.get_sql(), {"ds_id": datasource_id}

    def get_distinct_values_for_properties(
        self, all_props: List[str], date: str, ds_id: str
    ):
        return self.execute_get_query(
            *self.build_distinct_values_for_properties_query(all_props, date, ds_id)
        )

    def build_distinct_values_for_properties_query(
        self, all_props: List[str], date: str, ds_id: str
    ):
        query = ClickHouseQuery.from_(self.table)
        for prop in all_props:
            query = query.select(fn.Count(Field(f"properties.{prop}")).distinct())
        query = query.where(
            Criterion.all(
                [
                    self.table.datasource_id == Parameter("%(ds_id)s"),
                    self.date_func(self.table.timestamp) == Parameter("%(date)s"),
                ]
            )
        )
        return query.get_sql(), {"ds_id": ds_id, "date": date}

    def get_values_for_property(
        self, datasource_id: str, event_property: str, start_date: str, end_date: str
    ):
        return self.execute_get_query(
            *self.build_values_for_property_query(
                datasource_id, event_property, start_date, end_date
            )
        )

    def build_values_for_property_query(
        self, datasource_id: str, event_property: str, start_date: str, end_date: str
    ):
        query = (
            ClickHouseQuery.from_(self.table)
            .select(Field(f"properties.{event_property}"))
            .distinct()
            .where(Criterion.all(self.total_criterion))
        )
        return query.get_sql(), {
            "ds_id": datasource_id,
            "start_date": start_date,
            "end_date": end_date,
        }

    def get_all_datasources(self):
        query, params = self.build_get_all_datasources_query()
        return self.execute_get_query(query, params)

    def build_get_all_datasources_query(self):
        query = (
            ClickHouseQuery.from_(self.table)
            .select(self.table.datasource_id)
            .distinct()
        )
        return query.get_sql(), {}
