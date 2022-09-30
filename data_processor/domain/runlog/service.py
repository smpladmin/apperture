import logging
import os

import requests

from domain.runlog.models import RunLogStatus


class RunLogService:
    def update_started(self, datasource_id: str, date: str):
        self._update_status(datasource_id, date, RunLogStatus.STARTED)

    def update_completed(self, datasource_id: str, date: str):
        self._update_status(datasource_id, date, RunLogStatus.COMPLETED)

    def update_failed(self, datasource_id: str, date: str):
        self._update_status(datasource_id, date, RunLogStatus.FAILED)

    def _update_status(self, datasource_id: str, date: str, status: RunLogStatus):
        requests.put(
            f"{os.getenv('BACKEND_BASE_URL')}/private/runlogs",
            json={"datasource_id": datasource_id, "date": date, "status": status},
            headers={
                f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv(
                    "BACKEND_API_KEY_SECRET"
                )
            },
        )
