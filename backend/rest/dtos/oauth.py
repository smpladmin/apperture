from typing import Optional
from pydantic import BaseModel


class OAuthState(BaseModel):
    app_id: str
    user_id: str
    redirect_url: Optional[str]
