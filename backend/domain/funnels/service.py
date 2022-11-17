from fastapi import Depends
from typing import List
from mongo import Mongo
from beanie import PydanticObjectId
from datetime import datetime

from domain.funnels.models import Funnel, FunnelStep, ComputedFunnelStep, ComputedFunnel
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
                event=step.event,
                users=events_data[0][i],
                conversion=float(
                    "{:.2f}".format(self.compute_conversion(i, events_data[0]))
                ),
            )
            for i, step in enumerate(steps)
        ]

        return computed_funnel

    async def get_funnel(self, id: str) -> Funnel:
        return await Funnel.get(id)

    async def get_computed_funnel(
        self, funnel: Funnel, provider: str
    ) -> ComputedFunnel:
        computed_funnel = await self.compute_funnel(
            ds_id=str(funnel.datasource_id), provider=provider, steps=funnel.steps
        )
        return ComputedFunnel(
            datasource_id=funnel.datasource_id,
            steps=funnel.steps,
            name=funnel.name,
            random_sequence=funnel.random_sequence,
            computed_funnel=computed_funnel,
        )

    async def update_funnel(self, funnel_id: str, new_funnel: Funnel):
        to_update = new_funnel.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()

        await Funnel.find_one(
            Funnel.id == PydanticObjectId(funnel_id),
        ).update({"$set": to_update})
