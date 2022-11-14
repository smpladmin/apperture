from fastapi import Depends
from typing import List
from mongo import Mongo
from beanie import PydanticObjectId

from domain.funnels.models import Funnel, FunnelStep, ComputedFunnelStep
from repositories.clickhouse.funnels import Funnels


class FunnelsService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
        funnels: Funnels = Depends(),
    ):
        self.mongo = mongo
        self.funnels = funnels

    def build_funnel(
        self,
        datasourceId: str,
        userId: str,
        name: str,
        steps: List[FunnelStep],
        randomSequence: bool,
    ) -> Funnel:
        return Funnel(
            datasource_id=PydanticObjectId(datasourceId),
            user_id=userId,
            name=name,
            steps=steps,
            random_sequence=randomSequence,
        )

    async def add_funnel(self, funnel: Funnel):
        funnel.updated_at = funnel.created_at
        await Funnel.insert(funnel)

    def compute_conversion(self, n, data) -> float:
        return (
            (data[n] * 100 / data[n - 1] if data[n - 1] != 0 else 0) if n != 0 else 100
        )

    async def compute_funnel(
        self, ds_id: str, provider: str, steps: List[FunnelStep]
    ) -> List[ComputedFunnelStep]:

        events_data = self.funnels.get_events_data(ds_id, steps, provider)
        computed_funnel = [
            ComputedFunnelStep(
                event_name=step.event,
                users=events_data[0][i],
                conversion=float(
                    "{:.2f}".format(self.compute_conversion(i, events_data[0]))
                ),
            )
            for i, step in enumerate(steps)
        ]

        return computed_funnel
