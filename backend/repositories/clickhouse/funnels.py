from fastapi import Depends
from typing import List, Tuple
import logging

from clickhouse import Clickhouse
from domain.funnels.models import FunnelStep


class Funnels:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = "events"

    def get_events_data(
        self, ds_id: str, steps: List[FunnelStep], provider: str
    ) -> List[Tuple]:
        self.uid = "user_id"
        query, parameters = self.query_builder(ds_id, steps)
        query_result = self.clickhouse.client.query(query=query, parameters=parameters)
        return query_result.result_set

    def query_builder(self, ds_id: str, steps: List[FunnelStep]):
        parameters = {"ds_id": ds_id, "epoch_year": 1970}

        static_components = [
            "with ",
            f" select count(distinct table1.{self.uid}) as {steps[0].event}, ",
            " from table1 ",
        ]

        dynamic_components_1, dynamic_components_2, dynamic_components_3 = [], [], []

        for i, step in enumerate(steps):
            parameters[f"event{i}"] = step.event
            cte1 = f"table{i+1} as (select {self.uid} as distinct_id, min(timestamp) as ts from {self.table} where datasource_id=%(ds_id)s and event_name=%(event{i})s "
            if step.filters:
                for j, filter in enumerate(step.filters):
                    parameters[f"filter{i}{j}"] = filter.value
                    cte1 += f"and properties.{filter.property}=%(filter{i}{j})s "
            cte1 += "group by 1)"
            dynamic_components_1.append(cte1)

            if i > 0:
                cte2 = f"count(case when(table{i + 1}.ts >= table{i}.ts and year(table{i}.ts) > %(epoch_year)s) then table{i + 1}.distinct_id else null end) as {step.event}"
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
