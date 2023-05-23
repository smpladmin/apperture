from typing import List, Optional, Union

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends

from domain.spreadsheets.service import SpreadsheetService
from rest.dtos.spreadsheets import TransientSpreadsheetsDto
from rest.middlewares import validate_jwt

router = APIRouter(
    tags=["spreadsheets"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/spreadsheets/transient/{dsId}")
async def compute_transient_spreadsheets(
    dsId: str,
    dto: TransientSpreadsheetsDto,
    spreadsheets_service: SpreadsheetService = Depends(),
):
    return spreadsheets_service.get_transient_spreadsheets(dsId, query=dto.query)
