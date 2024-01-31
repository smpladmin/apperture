import logging
import os
import re
import time
from typing import Optional
import requests
from fastapi import APIRouter, Depends, HTTPException
from domain.apps.service import AppService
from domain.cdc.service import CDCService

from domain.integrations.models import ServerType
from rest.middlewares import validate_jwt
from domain.integrations.service import IntegrationService

router = APIRouter(
    tags=["cdc"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)

KAFKA_CONNECTOR_BASE_URL = os.getenv(
    "KAFKA_CONNECTOR_BASE_URL", "http://connect:8083/connectors/"
)


@router.post("/cdc")
async def create_cdc_connector(
    id: str,
    dto: dict,
    integration_service: IntegrationService = Depends(),
):
    config = {}
    headers = {"Accept": "application/json", "Content-Type": "application/json"}

    if dto:
        config = dto
    else:
        integration = await integration_service.get_integration(id=id)
        credential = integration.credential.cdc_credential
        config = integration_service.generate_connector_config(
            tables=credential.tables, credential=credential, integration_id=id
        )

    data = {
        "name": f"cdc_{id}",
        "config": config,
    }
    return requests.post(
        url=KAFKA_CONNECTOR_BASE_URL, json=data, headers=headers
    ).json()


@router.delete("/cdc/{name}")
async def delete_cdc_connector(
    name: str,
):
    requests.delete(url=f"{KAFKA_CONNECTOR_BASE_URL}{name}")
    return {"success"}


@router.get("/cdc")
async def get_cdc_connectors():
    return requests.get(url=KAFKA_CONNECTOR_BASE_URL).json()


@router.get("/cdc/{name}")
async def get_cdc_connectors(
    name: str,
):
    return requests.get(url=f"{KAFKA_CONNECTOR_BASE_URL}{name}").json()


def extract_integration_id_from_connector_name(name):
    id_pattern = re.compile(r"cdc_(\w+)")
    match = id_pattern.search(name)

    if match:
        extracted_id = match.group(1)
        return extracted_id
    else:
        return None


@router.put("/cdc/{name}/config")
async def update_cdc_connector(
    name: str,
    dto: dict,
    resume: Optional[bool] = False,
    resume_date: Optional[str] = None,
    integration_service: IntegrationService = Depends(),
    cdc_service: CDCService = Depends(),
    app_service: AppService = Depends(),
):
    try:
        config_json = dto
        if resume:
            connector = requests.get(url=f"{KAFKA_CONNECTOR_BASE_URL}{name}").json()
            config = connector["config"]

            integration_id = extract_integration_id_from_connector_name(config["name"])
            integration = await integration_service.get_integration(id=integration_id)
            app = await app_service.get_app(id=integration.app_id)
            config_json = await cdc_service.generate_update_connector_config_to_resume(
                config=config, app=app, date=resume_date
            )

        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        return requests.put(
            url=f"{KAFKA_CONNECTOR_BASE_URL}{name}/config",
            json=config_json,
            headers=headers,
        ).json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=e)
