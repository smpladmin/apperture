from typing import List

from .models import Element


class ElementsService:
    def _escape(self, input: str) -> str:
        return input.replace('"', r"\"")

    def elements_to_string(self, elements: List[Element]) -> str:
        ret = []
        for element in elements:
            el_string = ""
            if element.tag_name:
                el_string += element.tag_name
            if element.attr_class:
                for single_class in sorted(element.attr_class):
                    el_string += ".{}".format(single_class.replace('"', ""))
            attributes = {
                **({"text": element.text} if element.text else {}),
                "nth-child": element.nth_child or 0,
                "nth-of-type": element.nth_of_type or 0,
                **({"href": element.href} if element.href else {}),
                **({"attr_id": element.attr_id} if element.attr_id else {}),
                **element.attributes,
            }
            print("---------", attributes)
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
