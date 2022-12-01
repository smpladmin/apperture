from rest.dtos.model_response import ModelResponse
from domain.common.models import SavedItems


class SavedItemsResponse(SavedItems, ModelResponse):
    class Config:
        allow_population_by_field_name = True
