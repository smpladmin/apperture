from fastapi import APIRouter, Depends
from rest.middlewares import validate_jwt
from domain.users.service import UserService
from rest.dtos.users import UserPropertyDto, UserPropertyResponse

router = APIRouter(
    tags=["user"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get("/user/property", response_model=UserPropertyResponse)
async def get_user(
    dto: UserPropertyDto,
    user_service: UserService = Depends(),
):
    return await user_service.get_user_properties(
        dto.user_id, dto.datasource_id, dto.event
    )
