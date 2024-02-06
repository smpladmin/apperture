from pydantic import BaseModel


class FaqDto(BaseModel):
    question: str
    answer: str
