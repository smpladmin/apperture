import json
import logging
from base64 import b64decode
from typing import Any, Union

import requests
from fastapi import APIRouter, Depends, Form, Response

from domain.clickstream.service import ClickstreamService
from domain.datasources.service import DataSourceService

router = APIRouter()


@router.post("/events/capture/decide/")
async def analyse_decide_call(
    v: str,
    ip: str,
    _: str,
    ver: str,
):
    return {"config": {"enable_collect_everything": True}, "sessionRecording": False}


@router.post("/events/capture/e/")
async def capture_click_stream(
    ip: str,
    _: str,
    ver: str,
    data: Union[str, None] = Form(...),
    clickstream_service: ClickstreamService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    decoded = json.loads(b64decode(data))
    payloads = decoded if type(decoded) == list else [decoded]
    for payload in payloads:
        datasource = await ds_service.get_datasource(payload["properties"]["token"])
        if datasource:
            await clickstream_service.update_events(
                datasource_id=payload["properties"]["token"],
                timestamp=payload["properties"]["$time"],
                user_id=payload["properties"]["$device_id"],
                event=payload["event"],
                properties=payload["properties"],
            )
        else:
            return {"success": False}
    return {"success": True}


@router.get("/events/capture/static/array.js")
async def get_js_sdk():
    res = requests.get("https://app-static.posthog.com/static/array.js")
    return Response(res.content, media_type="application/javascript; charset=UTF-8")


@router.get("/events/capture/static/array.js.map")
async def get_js_sdk_map():
    res = requests.get("https://app-static.posthog.com/static/array.js.map")
    return Response(res.content)


@router.get("/events/clickstream")
async def get_clickstream_events(
    dsId: str,
    clickstream_service: ClickstreamService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dsId)
    if datasource:
        return await clickstream_service.get_data_by_id(dsId=dsId)
    return {"count": 0, "data": []}


@router.get("/events/eventstream")
async def get_clickstream_events(
    dsId: str,
    clickstream_service: ClickstreamService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dsId)
    if datasource:
        return await clickstream_service.get_action_by_id(dsId=dsId)
    return {"count": 0, "data": []}
