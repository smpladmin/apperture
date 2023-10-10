from fastapi import APIRouter, Depends
from domain.apperture_users.service import AppertureUserService

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
    user_id: str = Depends(get_user_id),
    user_service: AppertureUserService = Depends(),
):
    key = uuid.uuid4()
    await user_service.update_api_key(user_id=user_id, api_key=str(key))
    return key
