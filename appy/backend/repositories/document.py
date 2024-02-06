from datetime import datetime
from typing import Optional
from beanie import (
    Document as BeanieDocument,
    Insert,
    Replace,
    SaveChanges,
    before_event,
    Update,
)
from pydantic import Field


class Document(BeanieDocument):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    @before_event([Insert, Replace, SaveChanges, Update])
    def set_updated_at(self):
        self.updated_at = datetime.utcnow()
