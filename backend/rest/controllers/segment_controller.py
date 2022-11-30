from fastapi import APIRouter, Depends
from domain.segments.service import SegmentService
from rest.dtos.segments import TransientSegmentDto

from rest.middlewares import validate_jwt


router = APIRouter(
    tags=["segments"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/segments/transient")
async def compute_segment(
    dto: TransientSegmentDto,
    segment_service: SegmentService = Depends(),
):
    return await segment_service.compute_segment(dto.datasourceId, dto.filters)
