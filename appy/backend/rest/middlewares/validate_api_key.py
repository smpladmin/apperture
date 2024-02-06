from typing import Optional

from fastapi import Depends, Header, HTTPException

from settings import appy_settings


async def validate_api_key(
    x_appy_api_key: Optional[str] = Header(None),
    settings=Depends(appy_settings),
):
    if not x_appy_api_key:
        raise HTTPException(status_code=401, detail="API KEY missing")
    if x_appy_api_key != settings.appy_api_key:
        raise HTTPException(status_code=401, detail="Invalid API KEY")
