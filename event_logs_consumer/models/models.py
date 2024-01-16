from pydantic import BaseModel


class ClickHouseRemoteConnectionCred(BaseModel):
    host: str
    port: int
    username: str
    password: str
