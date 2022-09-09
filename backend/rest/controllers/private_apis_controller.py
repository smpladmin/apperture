from fastapi import APIRouter, Depends
from domain.datasources.service import DataSourceService
from domain.integrations.service import IntegrationService
from rest.dtos.datasources import PrivateDataSourceResponse

from rest.middlewares import validate_api_key


router = APIRouter(
    tags=["private"],
    dependencies=[Depends(validate_api_key)],
    responses={401: {}},
    prefix="/private",
)


@router.get("/datasources/{id}")
async def get_datasource_with_credentials(
    id: str,
    ds_service: DataSourceService = Depends(),
    integration_service: IntegrationService = Depends(),
):
    datasource = await ds_service.get_datasource(id)
    integration = await integration_service.get_integration(datasource.integration_id)
    return PrivateDataSourceResponse(
        datasource=datasource,
        credential=integration.credential,
    )
