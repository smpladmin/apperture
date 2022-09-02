from beanie import PydanticObjectId
from authorisation.models import IntegrationOAuth
from domain.apps.models import App
from domain.users.models import User
from .models import Credential, CredentialType, Integration, IntegrationProvider


class IntegrationService:
    async def create_oauth_integration(
        self,
        user: User,
        app: App,
        provider: IntegrationProvider,
        integration_oauth: IntegrationOAuth,
    ):
        credential = Credential(
            type=CredentialType.OAUTH,
            account_id=integration_oauth.account_id,
            refresh_token=integration_oauth.refresh_token,
        )
        integration = Integration(
            user_id=user.id,
            app_id=app.id,
            provider=provider,
            credential=credential,
        )
        await integration.insert()
        return integration

    async def get_integration(self, id: str, user_id: str) -> Integration:
        return await Integration.find_one(
            Integration.id == PydanticObjectId(id),
            Integration.user_id == PydanticObjectId(user_id),
        )
