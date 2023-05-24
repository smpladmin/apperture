from typing import List, Optional, Union

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends

from domain.spreadsheets.service import SpreadsheetService
from rest.dtos.spreadsheets import (
    TransientSpreadsheetsDto,
    ComputedSpreadsheetQueryResponse,
)
from rest.middlewares import validate_jwt

router = APIRouter(
    tags=["spreadsheets"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/spreadsheets/transient", response_model=ComputedSpreadsheetQueryResponse)
async def compute_transient_spreadsheets(
    dto: TransientSpreadsheetsDto,
    spreadsheets_service: SpreadsheetService = Depends(),
):
    return spreadsheets_service.get_transient_spreadsheets(
        dsId=dto.datasourceId, query=dto.query
    )
