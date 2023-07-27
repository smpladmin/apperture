import os
import string

from beanie import PydanticObjectId

from domain.files.models import File, FileType
from domain.integrations.models import CSVCredential


class FilesService:
    def build_s3_key(self, app_id: str, filename: str) -> str:
        return f"csvs/{app_id}/{filename}"

    def extract_tablename_from_filename(self, filename: str) -> str:
        file_name_without_extension = os.path.splitext(filename)[0]
        file_name_without_extension = file_name_without_extension.strip()

        translator = str.maketrans("", "", string.punctuation)
        tablename_without_punctuations = file_name_without_extension.translate(
            translator
        )
        tablename = "_".join(tablename_without_punctuations.split())

        return tablename

    async def add_file(self, filename: str, s3_key: str, app_id: str) -> File:
        file = File(
            filename=filename,
            filetype=FileType.CSV,
            app_id=PydanticObjectId(app_id),
            table_name=self.extract_tablename_from_filename(filename=filename),
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
