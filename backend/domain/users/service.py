from repositories.clickhouse.users import User
from fastapi import Depends
from typing import Union
from domain.users.models import UserDetails


class UserService:
    def __init__(self, user=Depends(User)):
        self.user = user

    async def get_user_properties(
        self, user_id: str, datasource_id: str, event: Union[str, None]
    ):
        result = self.user.get_user_properties(user_id, datasource_id, event)
        return UserDetails(
            user_id=user_id,
            datasource_id=datasource_id,
            property=result[0][0] if result and result[0] else {},
        )
