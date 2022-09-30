from enum import Enum


class RunLogStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    STARTED = "started"
    FAILED = "failed"
