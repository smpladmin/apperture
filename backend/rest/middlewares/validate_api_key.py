from typing import Optional
from fastapi import Depends, HTTPException, Header

from settings import apperture_settings


async def validate_api_key(
    apperture_api_key: Optional[str] = Header(None),
    settings=Depends(apperture_settings),
):
    if not apperture_api_key:
        raise HTTPException(status_code=401, detail="API KEY not provided")
    if apperture_api_key != settings.apperture_api_key:
        raise HTTPException(status_code=401, detail="Invalid API KEY")
