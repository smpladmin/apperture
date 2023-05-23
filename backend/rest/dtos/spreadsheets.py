from pydantic import BaseModel


class TransientSpreadsheetsDto(BaseModel):
    query: str
