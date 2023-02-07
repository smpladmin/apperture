from .models import Element
from typing import List


class ElementsService:
    def _escape(self, input: str) -> str:
        return input.replace('"', r"\"")

    def elements_to_string(self, elements:List[Element]) -> str:
        ret = []
        for element in elements:
            el_string = ""
            if "tag_name" in element:
                el_string += element["tag_name"]
            if "attr__class" in element:
                for single_class in sorted(element["classes"]):
                    el_string += ".{}".format(single_class.replace('"', ""))
            attributes = {
                **({"text": element["text"]} if "text" in element else {}),
                "nth-child": element["nth_child"] or 0,
                "nth-of-type": element["nth_of_type"] or 0,
                **({"href": element["href"]} if "href" in element else {}),
                **({"attr__id": element["attr__id"]} if "attr__id" in element else {}),
                **(element["attributes"] if "attributes" in element else {}),
            }
            attributes = {
                self._escape(key): self._escape(str(value))
                for key, value in sorted(attributes.items())
            }
            el_string += ":"
            el_string += "".join(
                ['{}="{}"'.format(key, value) for key, value in attributes.items()]
            )
            ret.append(el_string)
        return ";".join(ret)
