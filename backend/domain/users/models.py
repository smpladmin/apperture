from beanie import Document


class User(Document):
    first_name: str
    last_name: str
    email: str
    picture: str
