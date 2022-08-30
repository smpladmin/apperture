from pydantic import BaseModel


class OAuthUser(BaseModel):
    given_name: str
    family_name: str
    email: str
    picture: str


class IntegrationOAuth(BaseModel):
    refresh_token: str
    account_id: str
