import logging
from typing import List, Union

from fastapi import APIRouter, Depends, HTTPException
from fastapi import APIRouter, Depends
from domain.alerts.models import Alert
from domain.alerts.service import AlertService
from rest.dtos.alerts import AlertDto, AlertResponse

from rest.middlewares import get_user_id, validate_jwt


router = APIRouter(
    tags=["alerts"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post(
    "/alerts",
    response_model=AlertResponse,
)
async def save_alert_config(
    dto: AlertDto,
    alert_service: AlertService = Depends(),
):
    alert = alert_service.build_alert_config(
        datasource_id=dto.datasourceId,
        schedule=dto.schedule,
        type=dto.type,
        channel=dto.channel,
    )
    return await alert_service.save_alert_config(alert=alert)
