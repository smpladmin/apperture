from fastapi import APIRouter, Depends

from domain.datasources.service import DataSourceService
from domain.integrations.service import IntegrationService
from rest.middlewares import get_user_id, validate_jwt


router = APIRouter(
    tags=["integration"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get("/integrations/{id}/datasources")
async def get_datasources(
    id: str,
    from_provider: bool = False,
    user_id: str = Depends(get_user_id),
    integration_service: IntegrationService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    if from_provider:
        integration = await integration_service.get_integration(id, user_id)
        datasources = await ds_service.get_provider_datasources(
            integration.provider, integration.credential
        )
        return datasources
    return await ds_service.get_datasources(id)
