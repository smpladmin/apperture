import json
import os
from base64 import b64decode
from typing import Union

from fastapi import APIRouter, Depends, Form, Response

from domain.clickstream.service import ClickstreamService
from domain.datasources.service import DataSourceService

router = APIRouter()

ROOT_DIR = os.path.abspath(os.curdir)
array = open(f"{ROOT_DIR}/static/array.js", "r").read()
array_map = open(f"{ROOT_DIR}/static/array.js.map", "r").read()


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
    datasource = await ds_service.get_datasources_for_apperture(
        payloads[0]["properties"]["token"]
    )
    if datasource:
        ds = datasource[0]
        await clickstream_service.update_events(
            datasource_id=payloads[0]["properties"]["token"],
            events=payloads,
            app_id=ds.app_id,
        )
    else:
        return {"success": False}
    return {"success": True}


@router.get("/events/capture/static/array.js")
async def get_js_sdk():
    return Response(array, media_type="application/javascript; charset=UTF-8")


@router.get("/events/capture/static/array.js.map")
async def get_js_sdk_map():
    return Response(array_map)


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
