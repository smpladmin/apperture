from typing import Union

from beanie import PydanticObjectId
from fastapi import Depends, HTTPException, Request

from domain.actions.models import Action
from domain.apperture_users.models import AppertureUser
from domain.apps.service import AppService
from domain.datamart.models import DataMart
from domain.datasources.service import DataSourceService
from domain.funnels.models import Funnel
from domain.metrics.models import Metric
from domain.retention.models import Retention
from domain.segments.models import Segment
from domain.spreadsheets.models import WorkBook
from rest.middlewares import get_user


async def validate_library_items(
    request: Request,
    user: AppertureUser = Depends(get_user),
    app_service: AppService = Depends(),
):
    library_items_map = {
        "funnels": Funnel,
        "metrics": Metric,
        "segments": Segment,
        "retention": Retention,
        "datamart": DataMart,
        "workbooks": WorkBook,
        "actions": Action,
    }
    request_path = request.scope.get("path")
    path_details = request_path.split("/")
    item_type, item_id = path_details[1], path_details[2]
    collection = library_items_map.get(item_type)

    if collection:
        document = await collection.get(item_id)
        app_id = document.app_id

        is_valid_user = await app_service.is_valid_user_for_app(
            app_id=app_id, user=user
        )
        if not is_valid_user:
            raise HTTPException(status_code=403, detail="Access forbidden")


def _get_key_from_request(request: Request, key: str) -> Union[str, None]:
    value = None
    dto = request._json if hasattr(request, "_json") else None

    if key in request.query_params:
        value = request.query_params[key]
    elif dto:
        value = dto.get(key)

    return value


async def validate_app_user(
    request: Request,
    user: AppertureUser = Depends(get_user),
    app_service: AppService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    app_id = _get_key_from_request(request=request, key="app_id")

    if not app_id:
        datasource_id = (
            _get_key_from_request(request=request, key="datasource_id")
            or _get_key_from_request(request=request, key="datasourceId")
            or _get_key_from_request(request=request, key="dsId")
        )
        if datasource_id:
            datasource = await ds_service.get_datasource(datasource_id)
            app_id = datasource.app_id

    is_valid_user = await app_service.is_valid_user_for_app(app_id=app_id, user=user)
    if not is_valid_user:
        raise HTTPException(status_code=403, detail="Access forbidden")
