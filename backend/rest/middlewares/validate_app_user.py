from fastapi import Request, HTTPException, Depends
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


async def validate_library_items_middleware(
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


async def validate_app_user_middleware(
    request: Request,
    user: AppertureUser = Depends(get_user),
    app_service: AppService = Depends(),
    ds_service: DataSourceService = Depends(),
):
    ds_id = None
    app_id = None
    dto = request._json if hasattr(request, "_json") else None

    if "app_id" in request.query_params:
        app_id = request.query_params["app_id"]
    elif dto:
        app_id = dto.get("appId")

    if not app_id:
        if "datasource_id" in request.query_params:
            ds_id = request.query_params["datasource_id"]
        elif dto:
            ds_id = dto.get("datasourceId")

    if ds_id:
        datasource = await ds_service.get_datasource(ds_id)
        app_id = datasource.app_id

    is_valid_user = await app_service.is_valid_user_for_app(app_id=app_id, user=user)
    if not is_valid_user:
        raise HTTPException(status_code=403, detail="Access forbidden")
