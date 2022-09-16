from strategies.events_strategy_builder import EventsStrategyBuilder
from strategies.strategy_builder import StrategyBuilder
from domain.datasource.service import DataSourceService

ds_service = DataSourceService()


def process_data_for_datasource(ds_id: str):
    res = ds_service.get_datasource_with_credential(ds_id)
    strategy = StrategyBuilder.build(
        res.datasource.provider,
        res.datasource.version,
        "",
        res.credential.refresh_token,
        ds_id,
    )
    strategy.execute(
        res.credential.account_id,
        res.datasource.external_source_id,
    )


def process_event_data_for_datasource(ds_id: str, date: str):
    res = ds_service.get_datasource_with_credential(ds_id)
    strategy = EventsStrategyBuilder.build(res.datasource, res.credential, date)
    strategy.execute()
