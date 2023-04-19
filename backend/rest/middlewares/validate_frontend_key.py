from typing import Optional

from fastapi import Depends, Header, HTTPException

from settings import apperture_settings


async def validate_frontend_key(
    frontend_api_key: Optional[str] = Header(None),
    settings=Depends(apperture_settings),
):
    print(frontend_api_key, "====   ")
    if not frontend_api_key:
        raise HTTPException(status_code=401, detail="API KEY not provided")
    if frontend_api_key != settings.frontend_api_key:
        raise HTTPException(status_code=401, detail="Invalid API KEY")
