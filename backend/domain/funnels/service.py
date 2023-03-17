from typing import List, Union
from mongo import Mongo
from fastapi import Depends
from datetime import datetime
from beanie import PydanticObjectId
from beanie.operators import In


from domain.common.models import SavedItems
from domain.common.date_models import DateFilter
from domain.funnels.models import (
    Funnel,
    FunnelStep,
    ComputedFunnelStep,
    ComputedFunnel,
    FunnelTrendsData,
    FunnelConversionData,
    ConversionStatus,
    FunnelEventUserData,
)
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
        datasourceId: PydanticObjectId,
        appId: PydanticObjectId,
        userId: str,
        name: str,
        steps: List[FunnelStep],
        randomSequence: bool,
        dateFilter: Union[DateFilter, None],
    ) -> Funnel:
        return Funnel(
            datasource_id=datasourceId,
            app_id=appId,
            user_id=userId,
            name=name,
            steps=steps,
            random_sequence=randomSequence,
            date_filter=dateFilter,
        )

    async def add_funnel(self, funnel: Funnel):
        funnel.updated_at = funnel.created_at
        await Funnel.insert(funnel)

    def compute_conversion(self, n, data) -> float:
        return data[n] * 100 / data[0] if data[0] != 0 else 0

    def extract_date_range(self, date_filter: Union[DateFilter, None]):
        return (
            self.funnels.compute_date_filter(
                date_filter=date_filter.filter, date_filter_type=date_filter.type
            )
            if date_filter and date_filter.filter and date_filter.type
            else (None, None)
        )

    async def compute_funnel(
        self,
        ds_id: str,
        steps: List[FunnelStep],
        date_filter: Union[DateFilter, None],
    ) -> List[ComputedFunnelStep]:

        start_date, end_date = self.extract_date_range(date_filter=date_filter)

        users_data = self.funnels.get_users_count(
            ds_id=ds_id, steps=steps, start_date=start_date, end_date=end_date
        )
        computed_funnel = [
            ComputedFunnelStep(
                event=step.event,
                users=users_data[0][i],
                conversion=float(
                    "{:.2f}".format(self.compute_conversion(i, users_data[0]))
                ),
            )
            for i, step in enumerate(steps)
        ]

        return computed_funnel

    async def get_funnel(self, id: str) -> Funnel:
        return await Funnel.get(id)

    async def get_computed_funnel(self, funnel: Funnel) -> ComputedFunnel:
        computed_funnel = await self.compute_funnel(
            ds_id=str(funnel.datasource_id),
            steps=funnel.steps,
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

    async def get_funnel_trends(
        self,
        datasource_id: str,
        steps: List[FunnelStep],
        date_filter: Union[DateFilter, None],
    ) -> List[FunnelTrendsData]:

        start_date, end_date = self.extract_date_range(date_filter=date_filter)

        conversion_data = self.funnels.get_conversion_trend(
            ds_id=datasource_id, steps=steps, start_date=start_date, end_date=end_date
        )
        return [
            FunnelTrendsData(
                conversion="{:.2f}".format(data[2] * 100 / data[3]),
                first_step_users=data[3],
                last_step_users=data[2],
                start_date=datetime.strptime(f"{data[1]}-{data[0]}-1", "%Y-%W-%w"),
                end_date=datetime.strptime(f"{data[1]}-{data[0]}-0", "%Y-%W-%w"),
            )
            for data in conversion_data
        ]

    async def get_user_conversion(
        self,
        datasource_id: str,
        steps: List[FunnelStep],
        status: ConversionStatus,
        date_filter: Union[DateFilter, None],
    ):
        start_date, end_date = self.extract_date_range(date_filter=date_filter)

        conversion_data = self.funnels.get_conversion_analytics(
            ds_id=datasource_id,
            steps=steps,
            status=status,
            start_date=start_date,
            end_date=end_date,
        )
        user_list = [FunnelEventUserData(id=data[0]) for data in conversion_data]
        count_data = conversion_data[0][1] if conversion_data else [0, 0]
        return FunnelConversionData(
            users=user_list, total_users=count_data[0], unique_users=count_data[1]
        )

    async def get_funnels_for_apps(
        self, app_ids: List[PydanticObjectId]
    ) -> List[SavedItems]:
        return await Funnel.find(
            In(Funnel.app_id, app_ids),
            Funnel.enabled != False,
        ).to_list()

    async def get_funnels_for_datasource_id(self, datasource_id: str) -> List[Funnel]:
        return await Funnel.find(
            Funnel.datasource_id == PydanticObjectId(datasource_id),
            Funnel.enabled != False,
        ).to_list()

    async def delete_funnel(self, funnel_id: str):
        await Funnel.find_one(
            Funnel.id == PydanticObjectId(funnel_id),
        ).update({"$set": {"enabled": False}})
        return
