from repositories import Document


class RunLog(Document):
    datasource_id: str
    date: str

    class Settings:
        name = "runlogs"
