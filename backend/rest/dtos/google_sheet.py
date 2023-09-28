from pydantic import BaseModel


class TransientGoogleSheetsDto(BaseModel):
    query: str
