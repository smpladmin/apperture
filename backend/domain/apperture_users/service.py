from datetime import datetime

from beanie import PydanticObjectId

from authorisation import OAuthUser
from .models import AppertureUser


class AppertureUserService:
    async def create_user_if_not_exists(self, oauth_user: OAuthUser):
        existing_user = await AppertureUser.find_one(
            AppertureUser.email == oauth_user.email
        )
        if existing_user:
            if not existing_user.is_signed_up:
                return await self._upgrade_invited_user(
                    oauth_user=oauth_user, id=existing_user.id
                )
            else:
                return existing_user
        return await self._create_user(oauth_user)

    async def create_user_with_password(
        self, first_name: str, last_name: str, email: str, password_hash: str
    ):
        existing_user = await AppertureUser.find_one(AppertureUser.email == email)
        if existing_user:
            return existing_user

        apperture_user = AppertureUser(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password_hash,
        )
        await apperture_user.insert()
        return apperture_user

    async def reset_user_password(self, email: str, hashed_password: str):
        await AppertureUser.find_one(AppertureUser.email == email).update(
            {"$set": {"password": hashed_password}}
        )
        return await AppertureUser.find_one(AppertureUser.email == email)

    async def save_password(self, user: AppertureUser, password_hash: str):
        user.password = password_hash
        return await user.save()

    async def _build_user(self, oauth_user: OAuthUser):
        return AppertureUser(
            first_name=oauth_user.given_name,
            last_name=oauth_user.family_name,
            email=oauth_user.email,
            picture=oauth_user.picture,
            has_visted_sheets=False,
        )

    async def _create_user(self, oauth_user: OAuthUser):
        apperture_user = await self._build_user(oauth_user=oauth_user)
        await apperture_user.insert()
        return apperture_user

    async def get_user(self, id: str):
        return await AppertureUser.get(id)

    async def get_user_by_email(self, email: str):
        return await AppertureUser.find_one(AppertureUser.email == email)

    async def save_slack_credentials(self, user_id, slack_url, slack_channel):
        await AppertureUser.find_one(
            AppertureUser.id == PydanticObjectId(user_id),
        ).update({"$set": {"slack_url": slack_url, "slack_channel": slack_channel}})

        return

    async def remove_slack_credentials(self, user_id):
        await AppertureUser.find_one(
            AppertureUser.id == PydanticObjectId(user_id),
        ).update({"$unset": {"slack_url": 1, "slack_channel": 1}})

    async def update_visited_sheets_status(self, user_id):
        await AppertureUser.find_one(
            AppertureUser.id == PydanticObjectId(user_id),
        ).update({"$set": {"has_visted_sheets": True}})

    async def create_invited_user(self, email: str):
        apperture_user = AppertureUser(
            first_name="", last_name="", email=email, is_signed_up=False
        )
        await apperture_user.insert()
        return apperture_user

    async def _upgrade_invited_user(self, oauth_user: OAuthUser, id: PydanticObjectId):
        user = await self._build_user(oauth_user=oauth_user)
        to_update = {
            "updated_at": datetime.utcnow(),
            "is_signed_up": True,
        }
        to_update.update(
            user.dict(
                exclude={"id", "created_at", "email", "updated_at", "is_signed_up"}
            )
        )

        await AppertureUser.find_one(
            AppertureUser.id == id,
        ).update({"$set": to_update})

        return await AppertureUser.find_one(
            AppertureUser.id == id,
        )

    async def get_all_apperture_users(self):
        return await AppertureUser.find().to_list()
