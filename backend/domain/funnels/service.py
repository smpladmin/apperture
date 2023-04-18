from datetime import datetime
from typing import List, Union

from beanie import PydanticObjectId
from beanie.operators import In
from fastapi import Depends

from domain.common.date_models import DateFilter
from domain.funnels.models import (
    ComputedFunnelStep,
    ConversionStatus,
    ConversionWindow,
    ConversionWindowType,
    Funnel,
    FunnelConversionData,
    FunnelEventUserData,
    FunnelStep,
    FunnelTrendsData,
)
from mongo import Mongo
from repositories.clickhouse.funnels import Funnels


class FunnelsService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
        funnels: Funnels = Depends(),
    ):
        self.mongo = mongo
        self.funnels = funnels
        self.default_conversion_time = ConversionWindowType.DAYS.get_multiplier() * 30

    def build_funnel(
        self,
        datasource_id: PydanticObjectId,
        app_id: PydanticObjectId,
        user_id: str,
        name: str,
        steps: List[FunnelStep],
        random_sequence: bool,
        date_filter: Union[DateFilter, None],
        conversion_window: Union[ConversionWindow, None],
    ) -> Funnel:
        return Funnel(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            name=name,
            steps=steps,
            random_sequence=random_sequence,
            date_filter=date_filter,
            conversion_window=conversion_window,
        )

    async def add_funnel(self, funnel: Funnel):
        funnel.updated_at = funnel.created_at
        await Funnel.insert(funnel)

    def compute_conversion(
        self,
        step_number: int,
        funnel_stepwise_users: List[int],
        wrt_previous: bool = False,
    ) -> float:
        denominator = (
            (
                funnel_stepwise_users[step_number - 1]
                if step_number > 0
                else funnel_stepwise_users[step_number]
            )
            if wrt_previous
            else funnel_stepwise_users[0]
        )
        return (
            funnel_stepwise_users[step_number] * 100 / denominator
            if denominator != 0
            else 0
        )

    def compute_conversion_time(self, conversion_window: Union[ConversionWindow, None]):
        return (
            conversion_window.type.get_multiplier() * conversion_window.value
            if conversion_window and conversion_window.value
            else self.default_conversion_time
        )

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
        conversion_window: Union[ConversionWindow, None],
        random_sequence: Union[bool, None],
    ) -> List[ComputedFunnelStep]:

        start_date, end_date = self.extract_date_range(date_filter=date_filter)

        conversion_time = self.compute_conversion_time(
            conversion_window=conversion_window
        )
        [funnel_stepwise_users_data] = self.funnels.get_users_count(
            ds_id=ds_id,
            steps=steps,
            start_date=start_date,
            end_date=end_date,
            conversion_time=conversion_time,
            random_sequence=random_sequence,
        )
        computed_funnel = [
            ComputedFunnelStep(
                event=step.event,
                users=funnel_stepwise_users_data[i],
                conversion=float(
                    "{:.2f}".format(
                        self.compute_conversion(
                            step_number=i, funnel_stepwise_users=list(funnel_stepwise_users_data)
                        )
                    )
                ),
                conversion_wrt_previous=float(
                    "{:.2f}".format(
                        self.compute_conversion(
                            step_number=i,
                            funnel_stepwise_users=list(funnel_stepwise_users_data),
                            wrt_previous=True,
                        )
                    )
                ),
            )
            for i, step in enumerate(steps)
        ]

        return computed_funnel

    async def get_funnel(self, id: str) -> Funnel:
        return await Funnel.get(PydanticObjectId(id))

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
        conversion_window: Union[ConversionWindow, None],
        random_sequence: Union[bool, None],
    ) -> List[FunnelTrendsData]:

        conversion_time = self.compute_conversion_time(
            conversion_window=conversion_window
        )
        start_date, end_date = self.extract_date_range(date_filter=date_filter)

        conversion_data = self.funnels.get_conversion_trend(
            ds_id=datasource_id,
            steps=steps,
            start_date=start_date,
            end_date=end_date,
            conversion_time=conversion_time,
            random_sequence=random_sequence,
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
        conversion_window: Union[ConversionWindow, None],
        random_sequence: Union[bool, None],
    ):
        conversion_time = self.compute_conversion_time(
            conversion_window=conversion_window
        )
        start_date, end_date = self.extract_date_range(date_filter=date_filter)

        conversion_data = self.funnels.get_conversion_analytics(
            ds_id=datasource_id,
            steps=steps,
            status=status,
            start_date=start_date,
            end_date=end_date,
            conversion_time=conversion_time,
            random_sequence=random_sequence,
        )
        user_list = [FunnelEventUserData(id=data[0]) for data in conversion_data]
        count_data = conversion_data[0][1] if conversion_data else [0, 0]
        return FunnelConversionData(
            users=user_list, total_users=count_data[0], unique_users=count_data[1]
        )

    async def get_funnels_for_apps(
        self, app_ids: List[PydanticObjectId]
    ) -> List[Funnel]:
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
