from typing import List, Optional
from pydantic import BaseModel

from domain.spreadsheets.models import WordReplacement


class TableData(BaseModel):
    tableName: str
    wordReplacements: List[WordReplacement]


class TransientGoogleSheetsDto(BaseModel):
    query: str
    isSql: bool = True
    tableData: Optional[TableData]
