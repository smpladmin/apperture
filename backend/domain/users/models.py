from pydantic import BaseModel
from typing import Dict, Optional


class UserDetails(BaseModel):
    user_id: str
    datasource_id: str
    property: Dict
