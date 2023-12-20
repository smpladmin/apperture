import logging
from typing import List
import os
import json

from fastapi import APIRouter, Depends, HTTPException, Request
from starlette.responses import RedirectResponse

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException
from authorisation import OAuthClientFactory, OAuthProvider
from authorisation.oauth_provider import GoogleOauthContext

from domain.apperture_users.models import AppertureUser
from domain.apps.service import AppService
from domain.datamart.service import DataMartService
from domain.apperture_users.service import AppertureUserService
from domain.datamart_actions.service import DatamartActionService
from domain.datasources.service import DataSourceService
from domain.spreadsheets.models import DatabaseClient
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.datamart import (
    DataMartResponse,
    DataMartTableDto,
    DataMartWithUser,
)
from rest.dtos.datamart_actions import DatamartActionResponse
from rest.dtos.spreadsheets import (
    ComputedSpreadsheetQueryResponse,
    TransientSpreadsheetsDto,
)
from rest.middlewares import get_user, get_user_id, validate_jwt
from rest.middlewares.validate_app_user import validate_app_user, validate_library_items
from clickhouse_connect.driver.exceptions import DatabaseError
from utils.errors import BusinessError


router = APIRouter(
    tags=["datamart"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post(
    "/datamart/transient",
    response_model=ComputedSpreadsheetQueryResponse,
    dependencies=[Depends(validate_app_user)],
)
async def compute_datamart_query(
    dto: TransientSpreadsheetsDto,
    compute_query_action: ComputeQueryAction = Depends(),
    ds_service: DataSourceService = Depends(),
):
    try:
        datasource = await ds_service.get_datasource(dto.datasourceId)
        result = await compute_query_action.compute_query(
            app_id=datasource.app_id, dto=dto
        )
        return compute_query_action.create_spreadsheet_with_custom_headers(
            column_names=result.headers, data=result.data, sql=result.sql
        )
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")
    except DatabaseError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")


@router.post(
    "/datamart",
    response_model=DataMartResponse,
    dependencies=[Depends(validate_app_user)],
)
async def save_datamart_table(
    dto: DataMartTableDto,
    datasource_service: DataSourceService = Depends(),
    datamart_service: DataMartService = Depends(),
    user_id: str = Depends(get_user_id),
):
    datasource = await datasource_service.get_datasource(id=dto.datasourceId)
    datamart_table = datamart_service.build_datamart_table(
        datasource_id=PydanticObjectId(dto.datasourceId),
        app_id=datasource.app_id,
        user_id=user_id,
        name=dto.name,
        query=dto.query,
    )
    return await datamart_service.save_datamart(datamart=datamart_table)


@router.put(
    "/datamart/{id}",
    response_model=DataMartResponse,
    dependencies=[Depends(validate_app_user)],
)
async def update_datamart_table(
    id: str,
    dto: DataMartTableDto,
    datasource_service: DataSourceService = Depends(),
    datamart_service: DataMartService = Depends(),
    user_id: str = Depends(get_user_id),
):
    datasource = await datasource_service.get_datasource(dto.datasourceId)

    new_datamart_table = datamart_service.build_datamart_table(
        datasource_id=PydanticObjectId(dto.datasourceId),
        app_id=datasource.app_id,
        user_id=user_id,
        name=dto.name,
        query=dto.query,
    )

    await datamart_service.update_datamart_table(
        id=id,
        new_table=new_datamart_table,
    )
    return new_datamart_table


@router.get(
    "/datamart/{id}",
    response_model=DataMartResponse,
    dependencies=[Depends(validate_library_items)],
)
async def get_saved_datamart_table(
    id: str,
    datamart_service: DataMartService = Depends(),
):
    return await datamart_service.get_datamart_table(id=id)


@router.get(
    "/datamart",
    response_model=List[DataMartWithUser],
    dependencies=[Depends(validate_app_user)],
)
async def get_datamart_tables(
    datasource_id: str,
    user: AppertureUser = Depends(get_user),
    datasource_service: DataSourceService = Depends(),
    datamart_service: DataMartService = Depends(),
    datamart_action_service: DatamartActionService = Depends(),
):
    datasource = await datasource_service.get_datasource(id=datasource_id)
    datamarts = await datamart_service.get_datamart_tables_for_app_id(
        app_id=datasource.app_id
    )
    datamarts = [DataMartWithUser.from_orm(d) for d in datamarts]

    for datamart in datamarts:
        datamart_actions = (
            await datamart_action_service.get_datamart_actions_for_datamart(
                datamart_id=datamart.id
            )
        )
        actions = [DatamartActionResponse.from_orm(d) for d in datamart_actions]
        datamart.user = AppertureUserResponse.from_orm(user)
        datamart.actions = actions

    return datamarts


@router.delete(
    "/datamart/{id}",
    dependencies=[Depends(validate_library_items)],
)
async def delete_datamart_table(
    id: str,
    datamart_service: DataMartService = Depends(),
    datamart_action_service: DatamartActionService = Depends(),
    app_service: AppService = Depends(),
):
    existing_table = await datamart_service.get_datamart_table(id=id)
    app = await app_service.get_app(id=str(existing_table.app_id))
    if not app.clickhouse_credential:
        logging.info(f"Restricted user db doesn't exist for app!")
        raise HTTPException(
            status_code=401,
            detail=f"Restricted user db doesn't exist for app: {str(app.id)}!",
        )

    await datamart_service.delete_datamart_table(
        datamart_id=id,
        table_name=existing_table.table_name,
        clickhouse_credential=app.clickhouse_credential,
        app_id=str(app.id),
    )

    await datamart_action_service.delete_datamart_actions_for_datamart(datamart_id=id)


oauth = OAuthClientFactory().init_client(
    provider=OAuthProvider.GOOGLE,
    scope="https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly",
    google_oauth_context=GoogleOauthContext.SHEET,
)


@router.get("/datamart/oauth/google", dependencies=[Depends(validate_jwt)])
async def oauth_google(
    request: Request,
    user: AppertureUser = Depends(get_user),
    redirect_url: str = os.getenv("FRONTEND_LOGIN_REDIRECT_URL"),
):
    redirect_uri = str(request.url_for("datamart_google_authorise")).replace(
        "http", "https"
    )
    return await oauth.google.authorize_redirect(
        request,
        redirect_uri,
        state=json.dumps({"user_id": str(user.id), "redirect_url": redirect_url}),
        prompt="consent",
        access_type="offline",
    )


@router.get("/datamart/oauth/google/authorise")
async def datamart_google_authorise(
    request: Request,
    state: str,
    apperture_user_service: AppertureUserService = Depends(),
):
    state = json.loads(state)
    try:
        access_token = await oauth.google.authorize_access_token(request)
        refresh_token = access_token.get("refresh_token")

        await apperture_user_service.update_sheet_token(
            user_id=state["user_id"], token=refresh_token
        )
    except Exception as e:
        logging.error(e)

    return RedirectResponse(state["redirect_url"])
