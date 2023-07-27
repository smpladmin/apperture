from enum import Enum
from typing import Optional

from beanie import PydanticObjectId

from repositories.document import Document


class FileType(Enum):
    CSV = "csv"


class File(Document):
    filename: str
    filetype: Optional[FileType]
    app_id: PydanticObjectId
    s3_key: str
    table_name: str
    enabled: bool = True

    class Settings:
        name = "files"
