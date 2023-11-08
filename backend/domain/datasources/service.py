import asyncio
from typing import List, Optional

import httpx
from beanie import PydanticObjectId
from fastapi import Depends
from fastapi_cache.decorator import cache

from authorisation.service import AuthService
from cache.cache import CACHE_EXPIRY_24_HOURS, service_datasource_key_builder
from domain.apps.models import App
from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSource, DataSourceVersion, ProviderDataSource
from domain.integrations.models import Credential, Integration
from repositories.clickhouse.clickhouse_role import ClickHouseRole
from repositories.clickhouse.users import User
from settings import apperture_settings


class DataSourceService:
    def __init__(
        self,
        auth_service: AuthService = Depends(),
        clickhouse_role: ClickHouseRole = Depends(),
        settings=apperture_settings(),
    ):
        self.provider_datasource_methods = {}
        self.provider_datasource_methods[
            IntegrationProvider.GOOGLE
        ] = self.get_ga_datasources
        self.auth_service = auth_service
        self.clickhouse_role = clickhouse_role
        self.settings = settings

    async def get_provider_datasources(
        self, provider: IntegrationProvider, credential: Credential
    ):
        if provider not in self.provider_datasource_methods:
            raise NotImplementedError(
                f"Datasources fetch is not implemented for {provider}"
            )
        return await self.provider_datasource_methods[provider](credential)

    async def get_datasources(self, integration_id: str):
        return await DataSource.find(
            DataSource.integration_id == PydanticObjectId(integration_id)
        ).to_list()

    async def get_integration_datasources(self, integration_id: PydanticObjectId):
        return await DataSource.find(
            DataSource.integration_id == integration_id
        ).to_list()

    async def get_datasource(self, id: str):
        return await DataSource.get(id)

    @cache(expire=CACHE_EXPIRY_24_HOURS, key_builder=service_datasource_key_builder)
    async def get_datasources_for_apperture(self, id: str):
        return await DataSource.find(
            {
                DataSource.id: PydanticObjectId(id),
                DataSource.provider: IntegrationProvider.APPERTURE,
            }
        ).to_list()

    async def get_datasources_for_provider(self, provider: IntegrationProvider):
        return await DataSource.find(
            DataSource.provider == provider, DataSource.enabled != False
        ).to_list()

    async def get_datasources_for_app_id(self, app_id: PydanticObjectId):
        return await DataSource.find(
            DataSource.app_id == app_id, DataSource.enabled != False
        ).to_list()

    async def create_datasource(
        self,
        external_source_id: Optional[str],
        name: str,
        version: DataSourceVersion,
        integration: Integration,
    ) -> DataSource:
        datasource = DataSource(
            external_source_id=external_source_id,
            name=name,
            version=version,
            integration_id=integration.id,
            user_id=integration.user_id,
            app_id=integration.app_id,
            provider=integration.provider,
        )

        await datasource.insert()
        return datasource

    async def create_row_policy_for_username(
        self, datasource_id: str, username: str, app_id: str
    ):
        await self.clickhouse_role.create_row_policy(
            datasource_id=datasource_id, username=username, app_id=app_id
        )

    async def create_user_policy_for_all_datasources(
        self, datasources: List[DataSource], username: str
    ):
        for ds in datasources:
            await self.create_row_policy_for_username(
                datasource_id=ds.id, username=username, app_id=str(ds.app_id)
            )

    async def create_row_policy_for_datasources_by_app(self, app: App, username: str):
        datasources = await self.get_datasources_for_app_id(app.id)
        await self.create_user_policy_for_all_datasources(
            datasources=datasources, username=username
        )

    async def get_enabled_datasources(self):
        return await DataSource.find(DataSource.enabled == True).to_list()

    async def get_non_apperture_datasources(self):
        return await DataSource.find(
            DataSource.provider != IntegrationProvider.APPERTURE,
            DataSource.enabled == True,
        ).to_list()

    async def get_ga_datasources(self, credential: Credential):
        access_token = await self.auth_service.get_access_token(
            credential.refresh_token,
            IntegrationProvider.GOOGLE,
        )
        v4_sources, v3_sources = await self._fetch_ga_properties(access_token)
        return self._build_ga_provider_datasources(v4_sources, v3_sources)

    async def _fetch_ga_properties(self, access_token: str):
        async with httpx.AsyncClient() as client:
            v4_sources_p = client.get(
                "https://analyticsadmin.googleapis.com/v1alpha/accountSummaries",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            v3_sources_p = client.get(
                "https://analytics.googleapis.com/analytics/v3/management/accountSummaries",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            v4_sources_res, v3_sources_res = await asyncio.gather(
                v4_sources_p,
                v3_sources_p,
            )
            v4_sources = v4_sources_res.json()
            v3_sources = v3_sources_res.json()
            return [v4_sources, v3_sources]

    def _build_ga_provider_datasources(self, v4_sources, v3_sources):
        datasources = []
        for account in v4_sources.get("accountSummaries", []):
            for property in account.get("propertySummaries", []):
                datasources.append(
                    ProviderDataSource(
                        id=property["property"].split("/")[1],
                        name=property["displayName"],
                        version=DataSourceVersion.V4,
                        provider=IntegrationProvider.GOOGLE,
                    )
                )
        for item in v3_sources.get("items", []):
            for property in item.get("webProperties", []):
                for profile in property.get("profiles", []):
                    datasources.append(
                        ProviderDataSource(
                            id=profile["id"],
                            name=f"{property['name']} - {profile['name']}",
                            version=DataSourceVersion.V3,
                            provider=IntegrationProvider.GOOGLE,
                        )
                    )
        return datasources

    async def delete_datasource(self, ds_id: PydanticObjectId):
        await DataSource.find_one(
            DataSource.id == ds_id,
        ).update({"$set": {"enabled": False}})
        return
