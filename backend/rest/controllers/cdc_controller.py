import logging
import os
import time
from typing import Optional
import requests
from fastapi import APIRouter, Depends

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
    integration_service: IntegrationService = Depends(),
):
    integration = await integration_service.get_integration(id=id)
    credential = integration.credential.cdc_credential
    headers = {"Accept": "application/json", "Content-Type": "application/json"}
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


@router.post("/cdc/{name}/restart")
async def restart_cdc_connector(
    name: str, includeTasks: Optional[bool] = None, onlyFailed: Optional[bool] = None
):
    query_params = {}
    if includeTasks is not None:
        query_params["includeTasks"] = includeTasks
    if onlyFailed is not None:
        query_params["onlyFailed"] = onlyFailed

    return requests.post(
        url=f"{KAFKA_CONNECTOR_BASE_URL}{name}/restart",
        json={},
        params=query_params,
    ).json()


@router.put("/cdc/{name}/config")
async def update_cdc_connector(name: str, dto: dict):
    try:
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        return requests.put(
            url=f"{KAFKA_CONNECTOR_BASE_URL}{name}/config",
            json=dto,
            headers=headers,
        ).json()
    except Exception as e:
        logging.info(f"Error updating connector configuration: {e}")
