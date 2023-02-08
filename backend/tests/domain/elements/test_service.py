from domain.elements.service import ElementsService


class TestElementsService:
    def setup_method(self):
        self.service = ElementsService()
        self.elements_list = [
            {
                "tag_name": "i",
                "classes": ["ri-route-fill"],
                "attr__class": "ri-route-fill",
                "attr__aria-hidden": "true",
                "attr__focusable": "false",
                "nth_child": 1,
                "nth_of_type": 1,
                "$el_text": "",
            },
            {
                "tag_name": "button",
                "$el_text": "",
                "classes": ["chakra-button", "css-vyn3p3"],
                "attr__type": "button",
                "attr__class": "chakra-button css-vyn3p3",
                "attr__aria-label": "Explore",
                "attr__aria-describedby": "tooltip-:r2:",
                "nth_child": 1,
                "nth_of_type": 1,
            },
            {
                "tag_name": "div",
                "classes": ["css-1cd4go2"],
                "attr__class": "css-1cd4go2",
                "nth_child": 1,
                "nth_of_type": 1,
            },
            {
                "tag_name": "div",
                "classes": ["css-0"],
                "attr__class": "css-0",
                "nth_child": 3,
                "nth_of_type": 3,
            },
            {
                "tag_name": "div",
                "classes": ["css-3h169z"],
                "attr__class": "css-3h169z",
                "nth_child": 1,
                "nth_of_type": 1,
            },
            {
                "tag_name": "div",
                "classes": ["css-1xhj18k"],
                "attr__class": "css-1xhj18k",
                "nth_child": 2,
                "nth_of_type": 1,
            },
            {"tag_name": "div", "attr__id": "__next", "nth_child": 1, "nth_of_type": 1},
            {
                "tag_name": "body",
                "classes": ["chakra-ui-light"],
                "attr__class": "chakra-ui-light",
                "attr__cz-shortcut-listen": "true",
                "nth_child": 2,
                "nth_of_type": 1,
            },
        ]

    def test_elements_to_string(self):
        result = self.service.elements_to_string(self.elements_list)
        assert (
            result
            == 'i.ri-route-fill:nth-child="1"nth-of-type="1";button.chakra-button.css-vyn3p3:nth-child="1"nth-of-type="1";div.css-1cd4go2:nth-child="1"nth-of-type="1";div.css-0:nth-child="3"nth-of-type="3";div.css-3h169z:nth-child="1"nth-of-type="1";div.css-1xhj18k:nth-child="2"nth-of-type="1";div:attr__id="__next"nth-child="1"nth-of-type="1";body.chakra-ui-light:nth-child="2"nth-of-type="1"'
        )
