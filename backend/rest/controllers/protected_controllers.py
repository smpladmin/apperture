import asyncio
import logging
from typing import List, Union

from fastapi import APIRouter, Depends

from rest.middlewares import validate_frontend_key

router = APIRouter(
    tags=["protected"],
    dependencies=[Depends(validate_frontend_key)],
    responses={401: {}},
    prefix="/protected",
)


@router.post("/metric/trends")
async def trends(id: str):
    return {"id": id}
