from fastapi import APIRouter, Depends

from domain.clickstream.service import ClickstreamService
from domain.datasources.service import DataSourceService
from rest.middlewares import validate_jwt

router = APIRouter(
    tags=["clickstream"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get("/clickstream/{dsId}")
async def get_clickstream_events(
    dsId: str,
    clickstream_service: ClickstreamService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    datasource = await ds_service.get_datasource(dsId)
    if datasource:
        return clickstream_service.get_data_by_id(dsId=dsId)
    return {"count": 0, "data": []}
