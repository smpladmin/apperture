import logging
from strategies.events_strategy_builder import EventsStrategyBuilder
from strategies.strategy_builder import StrategyBuilder
from domain.datasource.service import DataSourceService

logging.getLogger().setLevel(logging.INFO)


ds_service = DataSourceService()


def process_data_for_datasource(ds_id: str):
    logging.info("{x}: {y}".format(x="process_data_for_datasource", y="starts"))
    logging.info("{x}: {y}".format(x="Process running for id", y=ds_id))

    res = ds_service.get_datasource_with_credential(ds_id)

    logging.info("{x}: {y}".format(x="Strategy Building", y="starts"))
    strategy = StrategyBuilder.build(
        res.datasource.provider,
        res.datasource.version,
        "",
        res.credential.refresh_token,
        ds_id,
    )
    logging.info("{x}: {y}".format(x="Strategy Building", y="ends"))

    logging.info("{x}: {y}".format(x="Strategy Execution", y="starts"))
    strategy.execute(
        res.credential.account_id,
        res.datasource.external_source_id,
    )

    logging.info("{x}: {y}".format(x="Strategy Execution", y="ends"))
    logging.info("{x}: {y}".format(x="process_data_for_datasource", y="ends"))


def process_event_data_for_datasource(ds_id: str, runlog_id: str, date: str):
    logging.info("{x}: {y}".format(x="process_event_data_for_datasource", y="starts"))
    logging.info("{x}: {y}".format(x="Process running for id", y=ds_id))

    res = ds_service.get_datasource_with_credential(ds_id)
    logging.info("{x}: {y}".format(x="Strategy Building", y="starts"))
    strategy = EventsStrategyBuilder.build(
        res.datasource, res.credential, runlog_id, date
    )
    logging.info("{x}: {y}".format(x="Strategy Building", y="ends"))
    logging.info("{x}: {y}".format(x="Strategy Execution", y="starts"))
    strategy.execute()
    logging.info("{x}: {y}".format(x="Strategy Execution", y="ends"))

    logging.info("{x}: {y}".format(x="process_event_data_for_datasource", y="ends"))
