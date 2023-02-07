import logging
import json
from typing import Any, Union

from fastapi import APIRouter, Form, Depends
from base64 import b64decode

from domain.datasources.service import DataSourceService
from domain.clickstream.service import ClickstreamService

router = APIRouter()


@router.post("/events/capture/decide/")
async def test(
    v: Union[None, Any],
    ip: Union[None, Any],
    _: Union[None, Any],
    ver: Union[None, Any],
):
    return {"config": {"enable_collect_everything": True}, "sessionRecording": False}


@router.post("/events/capture/e/")
async def test(
    ip: Union[None, Any],
    _: Union[None, Any],
    ver: Union[None, Any],
    data: Union[str, None] = Form(...),
    clickstream_service: ClickstreamService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    decoded = json.loads(b64decode(data))
    payload = decoded[0] if type(decoded) == list else decoded
    datasource = await ds_service.get_datasource(payload["properties"]["token"])
    if datasource:
        await clickstream_service.update_events(
            datasource_id=payload["properties"]["token"],
            timestamp=payload["properties"]["$time"],
            user_id=payload["properties"]["$device_id"],
            event=payload["event"],
            properties=payload["properties"],
        )
        return {"success": True}
    return {"success": False}
