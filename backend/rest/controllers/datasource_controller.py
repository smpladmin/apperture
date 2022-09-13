from fastapi import APIRouter, Depends
from domain.edge.service import EdgeService
from rest.dtos.edges import EdgeResponse

from rest.middlewares import validate_jwt


router = APIRouter(
    tags=["datasource"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get("/datasources/{ds_id}/edges", response_model=list[EdgeResponse])
async def get_edges(ds_id: str, edge_service: EdgeService = Depends()):
    return await edge_service.get_edges(ds_id)
