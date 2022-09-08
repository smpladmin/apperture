import traceback

from strategies.strategy_builder import StrategyBuilder
from tenants.tenants_service import TenantsService


def process_data_for_all_tenants():
    tenants_service = TenantsService()
    tenants = tenants_service.get_tenants_unique_by_app_id()
    print(tenants)
    for tenant in tenants:
        print("Running for app id - ", tenant.app_id)
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
