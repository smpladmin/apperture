import logging
import traceback

from strategies.strategy_builder import StrategyBuilder
from domain.datasource.service import DataSourceService
from tenants.tenants_service import TenantsService

ds_service = DataSourceService()


def process_data_for_datasource(ds_id: str):
    res = ds_service.get_datasource_with_credential(ds_id)
    strategy = StrategyBuilder.build(
        res.datasource.provider,
        res.datasource.version,
        "",
        res.credential.refresh_token,
    )
    strategy.execute(
        res.credential.account_id,
        res.datasource.external_source_id,
    )
    traceback.print_exc()


def process_data_for_all_tenants():
    tenants_service = TenantsService()
    tenants = tenants_service.get_tenants_unique_by_app_id()
    logging.info(tenants)
    for tenant in tenants:
        logging.info(f"Running for app id - {tenant.app_id}")
        try:
            tokens = tenants_service.get_tokens(
                tenant.app_id, tenant.email, tenant.provider
            )
            strategy = StrategyBuilder.build(
                tenant.provider,
                tenant.version,
                tokens.access_token,
                tokens.refresh_token,
            )
            strategy.execute(tenant.email, tenant.app_id)
        except Exception as err:
            traceback.print_exc()


if __name__ == "__main__":
    process_data_for_all_tenants()
