from fastapi import APIRouter, Depends
from rest.dtos.data_processor import DataProcessorEnqueueDto

from rest.middlewares import validate_api_key
from data_processor_queue import dpq


router = APIRouter(
    tags=["dataprocessor"],
    dependencies=[Depends(validate_api_key)],
    responses={401: {}},
)


@router.post("/dataprocessor/enqueue")
async def update_edges(dto: DataProcessorEnqueueDto = None):
    job = dpq.enqueue("main.process_data_for_datasources", dto.datasource_ids)
    return {"submitted": True, "job_id": job.id}
