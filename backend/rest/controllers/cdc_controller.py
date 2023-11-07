import os
import requests
from fastapi import APIRouter, Depends

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
    data = {
        "name": f"cdc_{id}",
        "config": {
            "connector.class": credential.server_type.get_connector_class(),
            "database.hostname": credential.server,
            "database.port": "1433",
            "database.user": credential.username,
            "database.password": credential.password,
            "database.names": credential.database,
            "topic.prefix": f"cdc_{id}",
            "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
            "schema.history.internal.kafka.topic": f"schemahistory.cdc_{id}",
            "table.include.list": ", ".join(
                ["dbo." + table for table in credential.tables]
            ),
            "database.encrypt": False,
            "snapshot.mode": "initial",
        },
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
