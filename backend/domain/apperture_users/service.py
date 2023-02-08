from beanie import PydanticObjectId

from authorisation import OAuthUser
from .models import AppertureUser
from argon2 import PasswordHasher


class AppertureUserService:
    def __init__(self):
        self.hasher = PasswordHasher(time_cost=2, parallelism=1)

    async def create_user_if_not_exists(self, oauth_user: OAuthUser):
        existing_user = await AppertureUser.find_one(
            AppertureUser.email == oauth_user.email
        )
        if existing_user:
            return existing_user
        return await self._create_user(oauth_user)

    async def create_user_with_password(
        self, first_name: str, last_name: str, email: str, password: str
    ):
        existing_user = await AppertureUser.find_one(AppertureUser.email == email)
        if existing_user:
            return existing_user

        apperture_user = AppertureUser(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=self.hasher.hash(password),
        )
        await apperture_user.insert()
        return apperture_user

    async def _create_user(self, oauth_user: OAuthUser):
        apperture_user = AppertureUser(
            first_name=oauth_user.given_name,
            last_name=oauth_user.family_name,
            email=oauth_user.email,
            picture=oauth_user.picture,
        )
        await apperture_user.insert()
        return apperture_user

    async def get_user(self, id: str):
        return await AppertureUser.get(id)

    async def save_slack_credentials(self, user_id, slack_url, slack_channel):
        await AppertureUser.find_one(
            AppertureUser.id == PydanticObjectId(user_id),
        ).update({"$set": {"slack_url": slack_url, "slack_channel": slack_channel}})

        return

    async def remove_slack_credentials(self, user_id):
        await AppertureUser.find_one(
            AppertureUser.id == PydanticObjectId(user_id),
        ).update({"$unset": {"slack_url": 1, "slack_channel": 1}})

    async def find_user(self, email: str):
        return await AppertureUser.find_one(AppertureUser.email == email)
