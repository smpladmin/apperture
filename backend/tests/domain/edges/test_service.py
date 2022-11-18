from datetime import datetime
import pytest
from collections import namedtuple
from unittest.mock import AsyncMock, MagicMock
from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSource, DataSourceVersion
from domain.edge.models import AggregatedEdge, BaseEdge

from domain.edge.service import EdgeService


class TestEdgeService:
    def setup_method(self):
        mongo = MagicMock()
        edges_repository = MagicMock()
        BaseEdge.get_settings = MagicMock()
        FindMock = namedtuple("FindMock", ["aggregate"])
        AggregateMock = namedtuple("AggregateMock", ["to_list"])
        self.agg_mock = MagicMock(
            return_value=AggregateMock(
                to_list=AsyncMock(),
            ),
        )

        BaseEdge.find = MagicMock(
            return_value=FindMock(
                aggregate=self.agg_mock,
            ),
        )
        DataSource.get_settings = MagicMock()
        self.service = EdgeService(mongo, edges_repository)

    @pytest.mark.asyncio
    async def test_get_edges_google(self):
        """
        Should query mongodb to fetch edges data for GA provider
        """
        ga_datasource = DataSource(
            integration_id="636a1c61d715ca6baae65611",
            app_id="636a1c61d715ca6baae65611",
            user_id="636a1c61d715ca6baae65611",
            provider=IntegrationProvider.GOOGLE,
            external_source_id="123",
            version=DataSourceVersion.V4,
        )
        ga_datasource.id = "test-id"

        await self.service.get_edges(
            ga_datasource,
            "2019-01-01",
            "2019-03-31",
        )

        self.agg_mock.assert_called_once_with(
            [
                {
                    "$match": {
                        "$and": [
                            {"datasource_id": "test-id"},
                            {"date": {"$gte": datetime(2019, 1, 1, 0, 0)}},
                            {"date": {"$lte": datetime(2019, 3, 31, 0, 0)}},
                        ]
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "current_event": "$current_event",
                            "previous_event": "$previous_event",
                        },
                        "hits": {"$sum": "$hits"},
                        "users": {"$sum": "$users"},
                    }
                },
                {"$setWindowFields": {"output": {"totalCount": {"$count": {}}}}},
                {"$sort": {"hits": -1}},
                {"$limit": 100},
                {
                    "$project": {
                        "current_event": "$_id.current_event",
                        "previous_event": "$_id.previous_event",
                        "hits": 1,
                        "users": 1,
                    }
                },
            ],
            projection_model=AggregatedEdge,
        )

    @pytest.mark.asyncio
    async def test_get_edges_others(self):
        """
        Should query clickhousedb to fetch edges data and convert it to Aggregated Edge model
        """
        datasource = DataSource(
            integration_id="636a1c61d715ca6baae65611",
            app_id="636a1c61d715ca6baae65611",
            user_id="636a1c61d715ca6baae65611",
            provider=IntegrationProvider.MIXPANEL,
            external_source_id="123",
            version=DataSourceVersion.DEFAULT,
        )
        datasource.id = "test-id"
        self.service.edges.get_edges.return_value = [
            ("login", "home", 123, 200),
            ("home", "base", 155, 300),
        ]

        edges = await self.service.get_edges(
            datasource,
            "2019-01-01",
            "2019-03-31",
        )

        self.service.edges.get_edges.assert_called_once_with("test-id")
        assert edges == [
            AggregatedEdge(
                previous_event="login",
                current_event="home",
                users=123,
                hits=200,
            ),
            AggregatedEdge(
                previous_event="home",
                current_event="base",
                users=155,
                hits=300,
            ),
        ]
