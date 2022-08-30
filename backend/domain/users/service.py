from authorisation import OAuthUser
from .models import User


class UserService:
    async def create_user_if_not_exists(self, oauth_user: OAuthUser):
        existing_user = await User.find_one(User.email == oauth_user.email)
        if existing_user:
            return existing_user
        return await self._create_user(oauth_user)

    async def _create_user(self, oauth_user: OAuthUser):
        apperture_user = User(
            first_name=oauth_user.given_name,
            last_name=oauth_user.family_name,
            email=oauth_user.email,
            picture=oauth_user.picture,
        )
        await apperture_user.insert()
        return apperture_user

    async def get_user(self, id: str):
        return await User.get(id)
