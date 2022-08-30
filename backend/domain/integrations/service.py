from authorisation.models import IntegrationOAuth
from domain.apps.models import App
from domain.users.models import User
from .models import Credential, CredentialType, Integration, IntegrationVendor


class IntegrationService:
    async def create_oauth_integration(
        self,
        user: User,
        app: App,
        vendor: IntegrationVendor,
        integration_oauth: IntegrationOAuth,
    ):
        credential = Credential(
            type=CredentialType.OAUTH,
            account_id=integration_oauth.account_id,
            refresh_token=integration_oauth.refresh_token,
        )
        integration = Integration(
            user_id=str(user.id),
            app_id=str(app.id),
            vendor=vendor,
            vendor_apps=[],
            credential=credential,
        )
        await integration.insert()
        return integration
