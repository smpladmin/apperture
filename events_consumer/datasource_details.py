import logging

from apperture.backend_action import get
from models.models import ClickHouseCredentials, AppServerDetails


class DatasourceDetails:
    def __init__(self):
        self.datasource_ch_map = {}

    def get_details(self, datasource_id):
        try:
            if datasource_id not in self.datasource_ch_map:
                datasource = get(path=f"/private/datasources/{datasource_id}").json()
                app_id = datasource["datasource"]["appId"]
                app = get(path=f"/private/apps/{app_id}").json()
                self.datasource_ch_map[datasource_id] = AppServerDetails(
                    app_id=app_id,
                    ch_server_credential=(
                        ClickHouseCredentials(**app["remoteConnection"])
                        if app["remoteConnection"]
                        else None
                    ),
                )

            return self.datasource_ch_map[datasource_id]
        except Exception as e:
            logging.exception(e, stack_info=True)
            raise e
