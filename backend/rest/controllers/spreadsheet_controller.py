from fastapi import APIRouter, Depends, HTTPException

from domain.spreadsheets.service import SpreadsheetService
from rest.dtos.spreadsheets import (
    ComputedSpreadsheetQueryResponse,
    TransientSpreadsheetsDto,
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
    try:
        return spreadsheets_service.get_transient_spreadsheets(
            dsId=dto.datasourceId, query=dto.query
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")
