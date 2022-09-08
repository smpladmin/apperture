import requests

from tenants.types import Tenant, Tokens


class TenantsService:
    def __init__(self):
        self.tenants_url = "http://localhost:8080/useroauth/"
        self.access_token_url = (
            "http://localhost:8080/useroauth/credentials/{appId}/{email}"
        )

    def get_tenants_unique_by_app_id(self):
        response = requests.get(self.tenants_url)
        tenants = response.json()["payload"]
        unique_tenants = list({tenant["appId"]: tenant for tenant in tenants}.values())
        return list(
            map(
                lambda tenant: Tenant(
                    tenant["appId"],
                    tenant["provider"],
                    tenant["email"],
                    tenant.get("version", "V3"),
                ),
                unique_tenants,
            )
        )

    def get_tokens(self, app_id, tenant_email, provider):
        response = requests.get(
            self.access_token_url.format(appId=app_id, email=tenant_email)
        )
        payload_ = response.json()["payload"]
        if provider == "MIXPANEL":
            return Tokens(payload_["userName"], payload_["userSecret"])
        else:
            return Tokens(payload_["accessToken"], payload_["refreshToken"])
