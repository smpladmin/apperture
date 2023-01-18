from typing import List
from mongo import Mongo
from fastapi import Depends
from datetime import datetime
from beanie import PydanticObjectId
from beanie.operators import In


from domain.common.models import SavedItems, WatchlistItemType
from domain.funnels.models import (
    Funnel,
    FunnelStep,
    ComputedFunnelStep,
    ComputedFunnel,
    FunnelTrendsData,
    FunnelConversionData,
    FunnelConversion,
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
    ) -> Funnel:
        return Funnel(
            datasource_id=datasourceId,
            app_id=appId,
            user_id=userId,
            name=name,
            steps=steps,
            random_sequence=randomSequence,
        )

    async def add_funnel(self, funnel: Funnel):
        funnel.updated_at = funnel.created_at
        await Funnel.insert(funnel)

    def compute_conversion(self, n, data) -> float:
        return data[n] * 100 / data[0] if data[0] != 0 else 0

    async def compute_funnel(
        self, ds_id: str, steps: List[FunnelStep]
    ) -> List[ComputedFunnelStep]:

        users_data = self.funnels.get_users_count(ds_id, steps)
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
            ds_id=str(funnel.datasource_id), steps=funnel.steps
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
        self, datasource_id: str, steps: List[FunnelStep]
    ) -> List[FunnelTrendsData]:
        conversion_data = self.funnels.get_conversion_trend(
            ds_id=datasource_id, steps=steps
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

    def get_converted_userlist(self, user_list, converted_data, dropped_data):
        if converted_data != None:
            converted_user_list = [
                FunnelEventUserData(id=data[0])
                for data in user_list[: converted_data["total_users"]]
            ]
            dropped_user_list = [
                FunnelEventUserData(id=data[0])
                for data in user_list[converted_data["total_users"] :]
            ]
        elif dropped_data != None:
            converted_user_list = [
                FunnelEventUserData(id=data[0])
                for data in user_list[dropped_data["total_users"] :]
            ]
            dropped_user_list = [
                FunnelEventUserData(id=data[0])
                for data in user_list[: dropped_data["total_users"]]
            ]
        return converted_user_list, dropped_user_list

    def format_conversion_data(self, user_list, count_data):
        dropped_data = None
        converted_data = None

        for data in count_data:
            if data[0] == ConversionStatus.CONVERTED:
                converted_data = {"total_users": data[1], "unique_users": data[2]}
            if data[0] == ConversionStatus.DROPPED:
                dropped_data = {"total_users": data[1], "unique_users": data[2]}

        converted_user_list, dropped_user_list = self.get_converted_userlist(
            user_list=user_list,
            converted_data=converted_data,
            dropped_data=dropped_data,
        )

        return dropped_data, dropped_user_list, converted_data, converted_user_list

    async def get_user_conversion(self, datasource_id: str, steps: List[FunnelStep]):

        user_list, count_data = self.funnels.get_conversion_analytics(
            ds_id=datasource_id, steps=steps
        )

        (
            dropped_data,
            dropped_user_list,
            converted_data,
            converted_user_list,
        ) = self.format_conversion_data(user_list=user_list, count_data=count_data)

        return FunnelConversion(
            converted=FunnelConversionData(
                users=converted_user_list,
                total_users=converted_data["total_users"] if converted_data else 0,
                unique_users=converted_data["unique_users"] if converted_data else 0,
            ),
            dropped=FunnelConversionData(
                users=dropped_user_list,
                total_users=dropped_data["total_users"] if dropped_data else 0,
                unique_users=dropped_data["unique_users"] if dropped_data else 0,
            ),
        )

    async def get_funnels_for_apps(
        self, app_ids: List[PydanticObjectId]
    ) -> List[SavedItems]:
        return await Funnel.find(
            In(Funnel.app_id, app_ids),
        ).to_list()
