from domain.elements.models import Element
from domain.elements.service import ElementsService


class TestElementsService:
    def setup_method(self):
        self.service = ElementsService()
        self.elements_list = [
            Element(
                text="",
                tag_name="i",
                href=None,
                attr_id=None,
                attr_class=["ri-route-fill"],
                nth_child=1,
                nth_of_type=1,
                attributes={},
            ),
            Element(
                text="",
                tag_name="button",
                href=None,
                attr_id=None,
                attr_class=["chakra-button", "css-vyn3p3"],
                nth_child=1,
                nth_of_type=1,
                attributes={},
            ),
            Element(
                text=None,
                tag_name="div",
                href=None,
                attr_id=None,
                attr_class=["css-1cd4go2"],
                nth_child=1,
                nth_of_type=1,
                attributes={},
            ),
            Element(
                text=None,
                tag_name="div",
                href=None,
                attr_id=None,
                attr_class=["css-0"],
                nth_child=3,
                nth_of_type=3,
                attributes={},
            ),
            Element(
                text=None,
                tag_name="div",
                href=None,
                attr_id=None,
                attr_class=["css-3h169z"],
                nth_child=1,
                nth_of_type=1,
                attributes={},
            ),
            Element(
                text=None,
                tag_name="div",
                href=None,
                attr_id=None,
                attr_class=["css-1xhj18k"],
                nth_child=2,
                nth_of_type=1,
                attributes={},
            ),
            Element(
                text=None,
                tag_name="div",
                href=None,
                attr_id="__next",
                attr_class=None,
                nth_child=1,
                nth_of_type=1,
                attributes={},
            ),
            Element(
                text=None,
                tag_name="body",
                href=None,
                attr_id=None,
                attr_class=["chakra-ui-light"],
                nth_child=2,
                nth_of_type=1,
                attributes={},
            ),
        ]

    def test_elements_to_string(self):
        result = self.service.elements_to_string(self.elements_list)
        assert (
            result
            == 'i.ri-route-fill:nth-child="1"nth-of-type="1";button.chakra-button.css-vyn3p3:nth-child="1"nth-of-type="1";div.css-1cd4go2:nth-child="1"nth-of-type="1";div.css-0:nth-child="3"nth-of-type="3";div.css-3h169z:nth-child="1"nth-of-type="1";div.css-1xhj18k:nth-child="2"nth-of-type="1";div:attr_id="__next"nth-child="1"nth-of-type="1";body.chakra-ui-light:nth-child="2"nth-of-type="1"'
        )
