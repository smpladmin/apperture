from typing import Optional

from fastapi import Depends, Header, HTTPException

from domain.apps.service import AppService


async def validate_app_api_key(
    apperture_api_key: Optional[str] = Header(None), app_service: AppService = Depends()
):
    if not apperture_api_key:
        raise HTTPException(status_code=401, detail="API KEY not provided")

    app = await app_service.get_app_by_api_key(api_key=apperture_api_key)
    if not app:
        raise HTTPException(status_code=401, detail="Invalid API KEY")
