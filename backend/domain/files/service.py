from beanie import PydanticObjectId
from fastapi import Depends

from domain.common.random_string_utils import StringUtils
from domain.files.models import File, FileType
from domain.integrations.models import CSVCredential


class FilesService:
    def __init__(
        self,
        string_utils: StringUtils = Depends(),
    ):
        self.string_utils = string_utils

    def build_s3_key(self, app_id: str, filename: str) -> str:
        return f"csvs/{app_id}/{filename}"

    async def add_file(self, filename: str, s3_key: str, app_id: str) -> File:
        file = File(
            filename=filename,
            filetype=FileType.CSV,
            app_id=PydanticObjectId(app_id),
            table_name=self.string_utils.extract_tablename_from_filename(
                filename=filename
            ),
            s3_key=s3_key,
        )
        file.updated_at = file.created_at
        await File.insert(file)
        return file

    async def get_file(self, id: str) -> File:
        return await File.get(PydanticObjectId(id))

    async def get_csv_credential(self, id: str) -> CSVCredential:
        file = await self.get_file(id=id)
        return CSVCredential(
            name=file.filename, s3_key=file.s3_key, table_name=file.table_name
        )

    async def get_file_by_app_id(self, app_id: str) -> File:
        return await File.find(File.app_id == PydanticObjectId(app_id)).to_list()
