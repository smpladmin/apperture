from typing import List, Union

from pydantic import BaseModel


class Element(BaseModel):
    text: str
    tag_name: str
    href: str
    attr_id: str
    attr_class: List[str]
    nth_child: int
    nth_of_type: int
    attributes: int
