from enum import Enum
from typing import List, Dict
from pydantic import BaseModel
from beanie import PydanticObjectId

from repositories import Document


class MetricFilterConditions(str, Enum):
    WHERE = "where"
    WHO = "who"
    AND = "and"
    OR = "or"