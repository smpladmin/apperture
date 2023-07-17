from unittest.mock import AsyncMock, MagicMock
from beanie import PydanticObjectId
import pytest
from domain.apps.models import App
from domain.common.models import IntegrationProvider
from domain.integrations.models import CredentialType, Integration
from domain.integrations.service import IntegrationService


class TestIntegrationService:
    def setup_method(self):
        App.get_settings = MagicMock()
        Integration.get_settings = MagicMock()
        Integration.insert = AsyncMock()

    @pytest.mark.asyncio
    async def test_create_integration(self):
        self.service = IntegrationService()
        user_id = PydanticObjectId()
        app = App(name="Test App", user_id=user_id)
        app.id = PydanticObjectId()
        provider = IntegrationProvider.MIXPANEL
        account_id = "12020"
        api_key = "mock-api-key"
        secret = "mock-secret"

        integration = await self.service.create_integration(
            app,
            provider,
            account_id,
            api_key,
            secret,
            None
        )

        assert integration.user_id == user_id
        assert integration.app_id == app.id
        assert integration.provider == provider
        assert integration.credential.type == CredentialType.API_KEY
        assert integration.credential.account_id == account_id
        assert integration.credential.api_key == api_key
        assert integration.credential.secret == secret
        assert integration.insert.called
        integration.insert.assert_awaited_once()
