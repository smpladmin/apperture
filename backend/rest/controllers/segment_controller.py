from fastapi import APIRouter, Depends
from domain.segments.service import SegmentService
from rest.dtos.segments import TransientSegmentDto, ComputedSegmentResponse

from rest.middlewares import validate_jwt


router = APIRouter(
    tags=["segments"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/segments/transient", response_model=ComputedSegmentResponse)
async def compute_transient_segment(
    dto: TransientSegmentDto,
    segment_service: SegmentService = Depends(),
):
    return await segment_service.compute_segment(
        datasource_id=str(dto.datasourceId),
        groups=dto.groups,
        columns=dto.columns,
        group_conditions=dto.groupConditions,
    )
