import logging
from fastapi import Depends
from typing import List, Tuple, Dict

from clickhouse import Clickhouse
from domain.funnels.models import FunnelStep


class Funnels:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = "events"
        self.uid = "user_id"

    def execute_get_query(self, query: str, parameters: Dict):
        query_result = self.clickhouse.client.query(query=query, parameters=parameters)
        return query_result.result_set

    def get_conversion_data(self, ds_id: str, steps: List[FunnelStep]) -> List[Tuple]:
        return self.execute_get_query(*self.trends_query_builder(ds_id, steps))

    def get_events_data(self, ds_id: str, steps: List[FunnelStep]) -> List[Tuple]:
        return self.execute_get_query(*self.users_query_builder(ds_id, steps))

    def users_query_builder(self, ds_id: str, steps: List[FunnelStep]):
        parameters = {"ds_id": ds_id, "epoch_year": 1970}

        static_components = [
            "with ",
            f" select count(distinct table1.{self.uid}), ",
            " from table1 ",
        ]

        dynamic_components_1, dynamic_components_2, dynamic_components_3 = [], [], []

        for i, step in enumerate(steps):
            parameters[f"event{i}"] = step.event
            cte1 = f"table{i+1} as (select {self.uid}, min(timestamp) as ts from {self.table} where datasource_id=%(ds_id)s and event_name=%(event{i})s "
            if step.filters:
                for j, filter in enumerate(step.filters):
                    parameters[f"filter{i}{j}"] = filter.value
                    cte1 += f"and properties.{filter.property}=%(filter{i}{j})s "
            cte1 += "group by 1)"
            dynamic_components_1.append(cte1)

            if i > 0:
                ts_conditionals = ""
                for j in range(i, 0, -1):
                    ts_conditionals += f"table{j+1}.ts > table{j}.ts and "

                cte2 = f"count(case when({ts_conditionals}year(table{i}.ts) > %(epoch_year)s) then table{i + 1}.user_id else null end)"
                cte3 = f"left join table{i + 1} on (table{i}.{self.uid}=table{i + 1}.{self.uid}) "
                dynamic_components_2.append(cte2)
                dynamic_components_3.append(cte3)

        query = static_components[0]
        query += ", ".join(dynamic_components_1)
        query += static_components[1]
        query += ", ".join(dynamic_components_2)
        query += static_components[2]
        query += " ".join(dynamic_components_3)

        logging.info(f"Executing query: {query}")
        return query, parameters

    def trends_query_builder(self, ds_id: str, steps: List[FunnelStep]):
        parameters = {"ds_id": ds_id, "epoch_year": 1970}

        static_components = [
            "with ",
            f" select week(table1.ts), year(table1.ts), ",
            f" count(distinct table1.{self.uid}) as conversion ",
            " from table1 ",
            " group by 1, 2",
        ]

        dynamic_components_1, dynamic_components_2, dynamic_components_3 = [], [], []

        for i, step in enumerate(steps):
            parameters[f"event{i}"] = step.event
            cte1 = f"table{i+1} as (select {self.uid}, min(timestamp) as ts from {self.table} where datasource_id=%(ds_id)s and event_name=%(event{i})s "
            if step.filters:
                for j, filter in enumerate(step.filters):
                    parameters[f"filter{i}{j}"] = filter.value
                    cte1 += f"and properties.{filter.property}=%(filter{i}{j})s "
            cte1 += "group by 1)"
            dynamic_components_1.append(cte1)

            if i > 0:
                ts_conditionals = ""
                for j in range(i, 0, -1):
                    ts_conditionals += f"table{j+1}.ts > table{j}.ts and "

                cte2 = f"count(case when({ts_conditionals}year(table{i}.ts) > %(epoch_year)s) then table{i + 1}.user_id else null end)"
                cte3 = f"left join table{i + 1} on (table{i}.{self.uid}=table{i + 1}.{self.uid} and week(table{i + 1}.ts)=week(table{i}.ts) and year(table{i + 1}.ts)=year(table{i + 1}.ts)) "
                dynamic_components_2.append(cte2)
                dynamic_components_3.append(cte3)

        query = static_components[0]
        query += ", ".join(dynamic_components_1)
        query += static_components[1]
        query += dynamic_components_2[-1] + "/" + static_components[2]
        query += static_components[3]
        query += " ".join(dynamic_components_3)
        query += static_components[4]

        logging.info(f"Executing query: {query}")
        return query, parameters
