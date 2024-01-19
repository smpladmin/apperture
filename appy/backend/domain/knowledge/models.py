from typing import Union
from pydantic import BaseModel


class FAQ(BaseModel):
    id: Union[str, None] = None
    question: str
    answer: str
