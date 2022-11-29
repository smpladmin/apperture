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
    NodeSankey,
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
        self.preprocessed_sankey = [
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="WebView_Open",
                hits=691,
                users=294,
                flow="inflow",
                hits_percentage=0,
                users_percentage=0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Video_Open",
                hits=374,
                users=265,
                flow="inflow",
                hits_percentage=0,
                users_percentage=0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Topic_Click",
                hits=336,
                users=234,
                flow="inflow",
                hits_percentage=0,
                users_percentage=0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Safety_Net_Data",
                hits=247,
                users=246,
                flow="inflow",
                hits_percentage=0,
                users_percentage=0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Download_Video",
                hits=147,
                users=146,
                flow="inflow",
                hits_percentage=0,
                users_percentage=0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Chapter_Click",
                hits=120,
                users=129,
                flow="inflow",
                hits_percentage=0,
                users_percentage=0,
            ),
            NodeSankey(
                node="Others",
                current_event="$ae_session",
                previous_event="Logout",
                hits=90,
                users=86,
                flow="inflow",
                hits_percentage=0,
                users_percentage=0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="Chapter_Click",
                previous_event="$ae_session",
                hits=454,
                users=262,
                flow="outflow",
                hits_percentage=0,
                users_percentage=0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="WebView_Open",
                previous_event="$ae_session",
                hits=391,
                users=143,
                flow="outflow",
                hits_percentage=0,
                users_percentage=0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="Video_Open",
                previous_event="$ae_session",
                hits=158,
                users=115,
                flow="outflow",
                hits_percentage=0,
                users_percentage=0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="Login",
                previous_event="$ae_session",
                hits=120,
                users=127,
                flow="outflow",
                hits_percentage=0,
                users_percentage=0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="Topic_Click",
                previous_event="$ae_session",
                hits=90,
                users=97,
                flow="outflow",
                hits_percentage=0,
                users_percentage=0,
            ),
        ]
        self.processed_sankey = [
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="WebView_Open ",
                hits=691,
                users=294,
                flow="inflow",
                hits_percentage=34.46,
                users_percentage=21.0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Video_Open ",
                hits=374,
                users=265,
                flow="inflow",
                hits_percentage=18.65,
                users_percentage=18.93,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Topic_Click ",
                hits=336,
                users=234,
                flow="inflow",
                hits_percentage=16.76,
                users_percentage=16.71,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Safety_Net_Data ",
                hits=247,
                users=246,
                flow="inflow",
                hits_percentage=12.32,
                users_percentage=17.57,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Others ",
                hits=357,
                users=361,
                flow="inflow",
                hits_percentage=17.81,
                users_percentage=25.79,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="Chapter_Click",
                previous_event="$ae_session",
                hits=454,
                users=262,
                flow="outflow",
                hits_percentage=22.64,
                users_percentage=18.71,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="WebView_Open",
                previous_event="$ae_session",
                hits=391,
                users=143,
                flow="outflow",
                hits_percentage=19.5,
                users_percentage=10.21,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="Video_Open",
                previous_event="$ae_session",
                hits=158,
                users=115,
                flow="outflow",
                hits_percentage=7.88,
                users_percentage=8.21,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="Others",
                previous_event="$ae_session",
                hits=210,
                users=224,
                flow="outflow",
                hits_percentage=10.47,
                users_percentage=16.0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="Exits",
                previous_event="$ae_session",
                hits=792,
                users=262,
                flow="outflow",
                hits_percentage=39.5,
                users_percentage=18.71,
            ),
        ]

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

    @pytest.mark.asyncio
    async def test_get_node_sankey_google(self):
        await self.service.get_node_sankey(
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
                            {"current_event": "test"},
                            {"date": {"$gte": datetime(2022, 1, 1, 0, 0)}},
                            {"date": {"$lte": datetime(2023, 1, 1, 0, 0)}},
                        ]
                    }
                },
                {
                    "$group": {
                        "_id": {"previous_event": "$previous_event"},
                        "node": {"$max": "$previous_event"},
                        "current_event": {"$max": "$current_event"},
                        "previous_event": {"$max": "$previous_event"},
                        "hits": {"$sum": "$hits"},
                        "users": {"$sum": "$users"},
                        "flow": {"$max": "inflow"},
                        "hits_percentage": {"$max": 0},
                        "users_percentage": {"$max": 0},
                    }
                },
                {"$sort": {"hits": -1}},
                {
                    "$unionWith": {
                        "coll": "edges",
                        "pipeline": [
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
                                    "_id": {"current_event": "$current_event"},
                                    "node": {"$max": "$current_event"},
                                    "current_event": {"$max": "$current_event"},
                                    "previous_event": {"$max": "$previous_event"},
                                    "hits": {"$sum": "$hits"},
                                    "users": {"$sum": "$users"},
                                    "flow": {"$max": "outflow"},
                                    "hits_percentage": {"$max": 0},
                                    "users_percentage": {"$max": 0},
                                }
                            },
                            {"$sort": {"hits": -1}},
                        ],
                    }
                },
            ],
            projection_model=NodeSankey,
        )

    @pytest.mark.asyncio
    async def test_get_node_sankey_others(self):
        self.datasource.id = "test-id"
        self.service.edges.get_node_sankey.return_value = [
            ("inflow", "WebView_Open", "$ae_session", 691, 294),
            ("inflow", "Video_Open", "$ae_session", 374, 265),
            ("inflow", "Topic_Click", "$ae_session", 336, 234),
            ("inflow", "Safety_Net_Data", "$ae_session", 247, 246),
            ("inflow", "Login", "$ae_session", 237, 230),
            ("inflow", "Video_Seen", "$ae_session", 120, 131),
            ("outflow", "$ae_session", "Chapter_Click", 454, 262),
            ("outflow", "$ae_session", "WebView_Open", 391, 143),
            ("outflow", "$ae_session", "Video_Open", 158, 115),
            ("outflow", "$ae_session", "Topic_Click", 110, 124),
            ("outflow", "$ae_session", "Video_Seen", 60, 60),
            ("outflow", "$ae_session", "Download_Video", 40, 40),
        ]
        assert self.processed_sankey == await self.service.get_node_sankey(
            datasource=self.datasource,
            node="$ae_session",
            start_date="2022-01-01",
            end_date="2023-01-01",
        )

        self.service.edges.get_node_sankey.assert_called_once_with(
            **{
                "ds_id": "test-id",
                "end_date": "2023-01-01",
                "event_name": "$ae_session",
                "start_date": "2022-01-01",
            }
        )

    def test_sankey_postprocessing(self):
        assert self.processed_sankey == self.service.sankey_postprocessing(
            sankey_nodes=self.preprocessed_sankey, provider=self.datasource.provider
        )

    @pytest.mark.parametrize(
        "provider, inflow_hits, outflow_hits, threshold",
        [
            (IntegrationProvider.GOOGLE, 100, 110, 5),
            (IntegrationProvider.GOOGLE, 110, 100, 5),
            (IntegrationProvider.MIXPANEL, 110, 100, 5),
            (IntegrationProvider.AMPLITUDE, 100, 110, 4),
        ],
    )
    def test_inflow_nodes_threshold(
        self,
        provider: IntegrationProvider,
        inflow_hits: int,
        outflow_hits: int,
        threshold: int,
    ):
        assert threshold == self.service.inflow_nodes_threshold(
            provider, inflow_hits, outflow_hits
        )

    @pytest.mark.parametrize(
        "provider, inflow_hits, outflow_hits, threshold",
        [
            (IntegrationProvider.GOOGLE, 100, 110, 4),
            (IntegrationProvider.GOOGLE, 110, 100, 4),
            (IntegrationProvider.MIXPANEL, 110, 100, 4),
            (IntegrationProvider.AMPLITUDE, 100, 110, 5),
        ],
    )
    def test_outflow_nodes_threshold(
        self,
        provider: IntegrationProvider,
        inflow_hits: int,
        outflow_hits: int,
        threshold: int,
    ):
        assert threshold == self.service.outflow_nodes_threshold(
            provider, inflow_hits, outflow_hits
        )

    def test_calculate_sankey_percentages(self):
        assert [
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="WebView_Open",
                hits=691,
                users=294,
                flow="inflow",
                hits_percentage=57.58,
                users_percentage=42.0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Video_Open",
                hits=374,
                users=265,
                flow="inflow",
                hits_percentage=31.17,
                users_percentage=37.86,
            ),
        ] == self.service.calculate_sankey_percentages(
            sankey_nodes=self.preprocessed_sankey[:2],
            inflow_hits=1200,
            outflow_hits=950,
            inflow_users=700,
            outflow_users=450,
        )

    def test_create_exit_nodes(self):
        assert NodeSankey(
            node="$ae_session",
            current_event="Exits",
            previous_event="WebView_Open ",
            hits=100,
            users=294,
            flow="inflow",
            hits_percentage=34.46,
            users_percentage=21.0,
        ) == self.service.create_exits_node(
            outflow_node=self.processed_sankey[0], hits=100, exits=True
        )

        assert NodeSankey(
            node="$ae_session",
            current_event="$ae_session",
            previous_event="Entrances",
            hits=100,
            users=294,
            flow="inflow",
            hits_percentage=34.46,
            users_percentage=21.0,
        ) == self.service.create_exits_node(
            outflow_node=self.processed_sankey[0], hits=100, exits=False
        )

    def test_create_others_nodes(self):
        assert [
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="WebView_Open",
                hits=691,
                users=294,
                flow="inflow",
                hits_percentage=0.0,
                users_percentage=0.0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Video_Open",
                hits=374,
                users=265,
                flow="inflow",
                hits_percentage=0.0,
                users_percentage=0.0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Topic_Click",
                hits=336,
                users=234,
                flow="inflow",
                hits_percentage=0.0,
                users_percentage=0.0,
            ),
            NodeSankey(
                node="$ae_session",
                current_event="$ae_session",
                previous_event="Others",
                hits=394,
                users=392,
                flow="inflow",
                hits_percentage=0.0,
                users_percentage=0.0,
            ),
        ] == self.service.create_others_node(
            nodes=self.preprocessed_sankey[:5], threshold=4
        )
