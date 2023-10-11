import logging
import os

import requests

from domain.runlog.models import RunLogStatus


class RunLogService:
    def update_started(self, runlog_id: str):
        self._update_status(runlog_id, RunLogStatus.STARTED)

    def update_completed(self, runlog_id: str):
        self._update_status(runlog_id, RunLogStatus.COMPLETED)

    def update_failed(self, runlog_id: str):
        self._update_status(runlog_id, RunLogStatus.FAILED)

    def _update_status(self, runlog_id: str, status: RunLogStatus):
        requests.put(
            f"{os.getenv('BACKEND_BASE_URL')}/private/runlogs/{runlog_id}",
            json={"status": status},
            headers={
                f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv(
                    "BACKEND_API_KEY_SECRET"
                )
            },
        )

    def get_events_list(self, runlog_id: str):
        return requests.get(
            f"{os.getenv('BACKEND_BASE_URL')}/private/runlogs/events/{runlog_id}",
            headers={
                f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv(
                    "BACKEND_API_KEY_SECRET"
                )
            },
        ).json()
