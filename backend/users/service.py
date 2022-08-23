from users.models import OAuthUser, User


class UserService:
    async def create_user_from_oauth_user(self, oauth_user: OAuthUser):
        apperture_user = User(
            first_name=oauth_user.given_name,
            last_name=oauth_user.family_name,
            email=oauth_user.email,
            picture=oauth_user.picture,
        )
        await apperture_user.insert()
        return apperture_user
