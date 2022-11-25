from datetime import datetime
import pytest
from collections import namedtuple
from unittest.mock import AsyncMock, MagicMock
from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSource, DataSourceVersion
from domain.edge.models import (
    AggregatedEdge,
    BaseEdge,
    NodeSignificance,
    NodeTrend,
    TrendType,
)

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
        self.ga_datasource = DataSource(
            integration_id="636a1c61d715ca6baae65611",
            app_id="636a1c61d715ca6baae65611",
            user_id="636a1c61d715ca6baae65611",
            provider=IntegrationProvider.GOOGLE,
            external_source_id="123",
            version=DataSourceVersion.V4,
        )
        self.datasource = DataSource(
            integration_id="636a1c61d715ca6baae65611",
            app_id="636a1c61d715ca6baae65611",
            user_id="636a1c61d715ca6baae65611",
            provider=IntegrationProvider.MIXPANEL,
            external_source_id="123",
            version=DataSourceVersion.DEFAULT,
        )

    @pytest.mark.asyncio
    async def test_get_edges_google(self):
        """
        Should query mongodb to fetch edges data for GA provider
        """
        self.ga_datasource.id = "test-id"

        await self.service.get_edges(
            self.ga_datasource,
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

        self.datasource.id = "test-id"
        self.service.edges.get_edges.return_value = [
            ("login", "home", 123, 200),
            ("home", "base", 155, 300),
        ]

        edges = await self.service.get_edges(
            self.datasource,
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

    @pytest.mark.asyncio
    async def test_get_node_significance_google(self):
        await self.service.get_node_significance(
            datasource=self.ga_datasource,
            node="test",
            start_date="2022-01-01",
            end_date="2023-01-01",
        )
        self.agg_mock.assert_called_once_with(
            [
                {
                    "$match": {
                        "$and": [
                            {"datasource_id": None},
                            {"date": {"$gte": datetime(2022, 1, 1, 0, 0)}},
                            {"date": {"$lte": datetime(2023, 1, 1, 0, 0)}},
                        ]
                    }
                },
                {
                    "$facet": {
                        "total_count": [
                            {
                                "$group": {
                                    "_id": {"_class_id": "$_class_id"},
                                    "hits": {"$sum": "$hits"},
                                }
                            }
                        ],
                        "current_node_count": [
                            {"$match": {"current_event": "test"}},
                            {
                                "$group": {
                                    "_id": {"event": "$current_event"},
                                    "hits": {"$sum": "$hits"},
                                }
                            },
                        ],
                        "previous_node_count": [
                            {"$match": {"previous_event": "test"}},
                            {
                                "$group": {
                                    "_id": {"event": "$previous_event"},
                                    "hits": {"$sum": "$hits"},
                                }
                            },
                        ],
                    }
                },
                {
                    "$project": {
                        "node": "test",
                        "node_hits": {
                            "$ifNull": [
                                {"$max": "$current_node_count.hits"},
                                {"$max": "$previous_node_count.hits"},
                            ]
                        },
                        "total_hits": {"$max": "$total_count.hits"},
                    }
                },
            ],
            projection_model=NodeSignificance,
        )

    @pytest.mark.asyncio
    async def test_get_node_significance_others(self):
        self.datasource.id = "test-id"
        self.service.edges.get_node_significance.return_value = [
            (10, 100, 12, 144),
        ]
        assert [
            NodeSignificance(
                node="test",
                node_hits=12,
                total_hits=144,
                node_users=10,
                total_users=100,
            )
        ] == await self.service.get_node_significance(
            datasource=self.datasource,
            node="test",
            start_date="2022-01-01",
            end_date="2023-01-01",
        )

        self.service.edges.get_node_significance.assert_called_once_with(
            **{
                "ds_id": "test-id",
                "end_date": "2023-01-01",
                "event_name": "test",
                "start_date": "2022-01-01",
            }
        )

    @pytest.mark.asyncio
    async def test_get_node_trends_google_date(self):
        await self.service.get_node_trends(
            datasource=self.ga_datasource,
            node="test",
            start_date="2022-01-01",
            end_date="2023-01-01",
            trend_type=TrendType.DATE,
            is_entrance_node=False,
        )
        self.agg_mock.assert_called_once_with(
            [
                {
                    "$match": {
                        "$and": [
                            {"datasource_id": None},
                            {"current_event": "test"},
                            {"date": {"$gte": datetime(2022, 1, 1, 0, 0)}},
                            {"date": {"$lte": datetime(2023, 1, 1, 0, 0)}},
                        ]
                    }
                },
                {
                    "$group": {
                        "_id": {"current_event": "$current_event", "date": "$date"},
                        "end_date": {"$max": "$date"},
                        "hits": {"$sum": "$hits"},
                        "node": {"$max": "$current_event"},
                        "start_date": {"$min": "$date"},
                        "trend": {"$max": "$date"},
                        "users": {"$sum": "$users"},
                        "year": {"$max": {"$year": "$date"}},
                    }
                },
                {"$sort": {"trend": 1, "year": 1}},
            ],
            projection_model=NodeTrend,
        )

    @pytest.mark.asyncio
    async def test_get_node_trends_google_week(self):
        await self.service.get_node_trends(
            datasource=self.ga_datasource,
            node="test",
            start_date="2022-01-01",
            end_date="2023-01-01",
            trend_type=TrendType.WEEK,
            is_entrance_node=True,
        )
        self.agg_mock.assert_called_once_with(
            [
                {
                    "$match": {
                        "$and": [
                            {"datasource_id": None},
                            {"previous_event": "test"},
                            {"date": {"$gte": datetime(2022, 1, 1, 0, 0)}},
                            {"date": {"$lte": datetime(2023, 1, 1, 0, 0)}},
                        ]
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "previous_event": "$previous_event",
                            "week": {"$week": "$date"},
                            "year": {"$year": "$date"},
                        },
                        "end_date": {"$max": "$date"},
                        "hits": {"$sum": "$hits"},
                        "node": {"$max": "$previous_event"},
                        "start_date": {"$min": "$date"},
                        "trend": {"$max": {"$week": "$date"}},
                        "users": {"$sum": "$users"},
                        "year": {"$max": {"$year": "$date"}},
                    }
                },
                {"$sort": {"trend": 1, "year": 1}},
            ],
            projection_model=NodeTrend,
        )

    @pytest.mark.asyncio
    async def test_get_node_trends_others(self):
        self.datasource.id = "test-id"
        self.service.edges.get_node_trends.return_value = (
            (
                2022,
                1,
                1111,
                6488,
                datetime(2022, 11, 6, 0, 0),
                datetime(2022, 11, 12, 0, 0),
            ),
            (
                2022,
                2,
                1371,
                6972,
                datetime(2022, 11, 13, 0, 0),
                datetime(2022, 11, 19, 0, 0),
            ),
        )
        assert [
            NodeTrend(
                node="test",
                year=2022,
                trend=1,
                users=1111,
                hits=6488,
                start_date=datetime(2022, 11, 6, 0, 0),
                end_date=datetime(2022, 11, 12, 0, 0),
            ),
            NodeTrend(
                node="test",
                year=2022,
                trend=2,
                users=1371,
                hits=6972,
                start_date=datetime(2022, 11, 13, 0, 0),
                end_date=datetime(2022, 11, 19, 0, 0),
            ),
        ] == await self.service.get_node_trends(
            datasource=self.datasource,
            node="test",
            start_date="2022-01-01",
            end_date="2023-01-01",
            trend_type=TrendType.WEEK,
            is_entrance_node=False,
        )

        self.service.edges.get_node_trends.assert_called_once_with(
            **{
                "ds_id": "test-id",
                "end_date": "2023-01-01",
                "event_name": "test",
                "start_date": "2022-01-01",
                "trend_type": TrendType.WEEK,
            }
        )
