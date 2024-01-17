from fastapi import APIRouter, Depends
from domain.apps.service import AppService

from rest.middlewares import validate_jwt
from rest.middlewares.get_user import get_user_id
import uuid


router = APIRouter(
    tags=["api_key_controller"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/api-key")
async def generate_api_key(
    app_id: str,
    app_service: AppService = Depends(),
):
    key = uuid.uuid4()
    await app_service.update_api_key(app_id=app_id, api_key=str(key))
    return key
