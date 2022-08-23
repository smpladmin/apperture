from pydantic import BaseModel
from beanie import Document
from mongo.document_response import DocumentResponse


class User(Document):
    first_name: str
    last_name: str
    email: str
    picture: str


class UserResponse(User, DocumentResponse):
    pass


class OAuthUser(BaseModel):
    given_name: str
    family_name: str
    email: str
    picture: str
