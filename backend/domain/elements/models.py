from typing import List, Optional, Dict

from pydantic import BaseModel


class Element(BaseModel):
    text: Optional[str]
    tag_name: Optional[str]
    href: Optional[str]
    attr_id: Optional[str]
    attr_class: Optional[List[str]]
    nth_child: Optional[int]
    nth_of_type: Optional[int]
    attributes: Dict
