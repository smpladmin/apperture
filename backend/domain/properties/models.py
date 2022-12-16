from enum import Enum
from typing import List
from pydantic import BaseModel
from beanie import PydanticObjectId

from repositories import Document


class PropertyDataType(str, Enum):
    DEFAULT = "default"


class Property(BaseModel):
    name: str
    type: str


class Properties(Document):
    datasource_id: PydanticObjectId
    properties: List[Property]

    class Settings:
        name = "properties"
