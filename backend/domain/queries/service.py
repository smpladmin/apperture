from datetime import datetime
from typing import Optional

from beanie import PydanticObjectId
from fastapi import Depends

from domain.queries.models import Queries
from mongo import Mongo
import pandas as pd
import numpy as np
from typing import List, Dict
from rest.dtos.queries import QueriesTableDto
from rest.controllers.actions.compute_query import ComputeQueryAction
from rest.dtos.spreadsheets import TransientSpreadsheetsDto
from domain.spreadsheets.models import (
    ComputedSpreadsheetWithCustomHeaders,
)
from fastapi import Depends, HTTPException
from clickhouse_connect.driver.exceptions import DatabaseError
from utils.errors import BusinessError


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

    async def get_datasource_id(self, id: str) -> Optional[PydanticObjectId]:
        query_data = await self.get_query_data(id)
        if query_data:
            return query_data.datasource_id
        return None

    async def compute_difference_between_queries(
        self,
        query_id1: str,
        query_id2: str,
        key_columns: List[str],
        compare_columns: Dict[str, str],
        compute_query_action: ComputeQueryAction,
    ) -> pd.DataFrame:
        datasource_id1 = str(await self.get_datasource_id(query_id1))
        datasource_id2 = str(await self.get_datasource_id(query_id2))

        dto1 = QueriesTableDto(query_id=query_id1, datasourceId=datasource_id1)
        dto2 = QueriesTableDto(query_id=query_id2, datasourceId=datasource_id2)

        result1 = await self.compute_queries(
            dto=dto1,
            compute_query_action=compute_query_action,
        )
        result2 = await self.compute_queries(
            dto=dto2,
            compute_query_action=compute_query_action,
        )
        column_names1 = [column.name for column in result1.headers]
        column_names2 = [column.name for column in result2.headers]

        df1 = pd.DataFrame(result1.data, columns=column_names1)
        df2 = pd.DataFrame(result2.data, columns=column_names2)

        merged_df = pd.merge(
            df1, df2, on=key_columns, how="outer", suffixes=("_query1", "_query2")
        )

        for col_df1, col_df2 in compare_columns.items():
            if col_df1 in merged_df.columns and col_df2 in merged_df.columns:
                merged_df[f"diff_{col_df1}_{col_df2}"] = (
                    merged_df[col_df1] - merged_df[col_df2]
                )
            else:
                merged_df[f"diff_{col_df1}_{col_df2}"] = None
        merged_df.replace([np.inf, -np.inf], np.nan, inplace=True)
        merged_df.fillna(0, inplace=True)
        return merged_df

    async def compute_queries(
        self,
        dto: QueriesTableDto,
        compute_query_action: ComputeQueryAction,
    ) -> ComputedSpreadsheetWithCustomHeaders:
        try:
            query_data = await self.get_query_data(dto.query_id)
            compute_dto = TransientSpreadsheetsDto(
                datasourceId=str(query_data.datasource_id),
                query=query_data.query,
                isDatamart=False,
                is_sql=True,
                ai_query=None,
            )
            result = await compute_query_action.compute_query(
                app_id=query_data.app_id, dto=compute_dto
            )
            result = compute_query_action.create_spreadsheet_with_custom_headers(
                column_names=result.headers, data=result.data, sql=result.sql
            )
            return result

        except BusinessError as e:
            raise HTTPException(
                status_code=400, detail=str(e) or "Something went wrong"
            )
        except DatabaseError as e:
            raise HTTPException(
                status_code=400, detail=str(e) or "Something went wrong"
            )
