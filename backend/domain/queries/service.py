from datetime import datetime


from beanie import PydanticObjectId
from fastapi import Depends


from domain.queries.models import Queries
from mongo import Mongo


class QueriesService:
    def __init__(self, mongo: Mongo = Depends()):
        self.mongo = mongo

    def build_queries_table(
        self,
        datasource_id: PydanticObjectId,
        app_id: PydanticObjectId,
        user_id: PydanticObjectId,
        query: str,
    ) -> Queries:
        now = datetime.now()
        return Queries(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            query=query,
        )

    async def save_queries(self, queries: Queries):
        return await Queries.insert(queries)

    async def get_query_data(self, id: str):
        return await Queries.find_one({"_id": PydanticObjectId(id)})

    async def get_queries_table(self, id: str) -> Queries:
        return await Queries.get(PydanticObjectId(id))
