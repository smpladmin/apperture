from pypika import Field
from pypika import functions as fn

from repositories.clickhouse.parser.formula_parser import FormulaParser


class TestFormulaParser:
    def setup_method(self):
        self.parser = FormulaParser()
        self.sum_wrapper = fn.Sum
        self.test_cases = ["A+B", "A-B", "A/B", "A*B", "A*2", "(A+B)/213.11*10"]
        self.test_sum_aggregation_results = [
            fn.Sum(Field("A")) + fn.Sum(Field("B")),
            fn.Sum(Field("A")) - fn.Sum(Field("B")),
            fn.Sum(Field("A")) / fn.Sum(Field("B")),
            fn.Sum(Field("A")) * fn.Sum(Field("B")),
            fn.Sum(Field("A")) * 2,
            fn.Sum(Field("A")) + fn.Sum(Field("B")) / 213.11 * 10,
        ]
        self.validation_test_cases = [
            "A+B",
            "A-B",
            "A/B",
            "A*B",
            "A*2",
            "(A+B)/213.11*10",
            "(12)()",
            "A@A",
            "2A/4",
            "2*100/C+B",
            "2*100/(A+B)",
        ]
        self.validation_results = [
            True,
            True,
            True,
            True,
            True,
            True,
            False,
            False,
            False,
            False,
            True,
        ]
        self.allowed_variables = [
            "A",
            "B",
        ]

    def test_parser_for_summation_aggregation(self):
        for test_case, result in zip(
            self.test_cases, self.test_sum_aggregation_results
        ):
            assert self.parser.parse(test_case, self.sum_wrapper) == result

    def test_parser_for_formula_validation(self):
        for test_case, result in zip(self.test_cases, self.validation_results):
            assert (
                self.parser.validate_formula(test_case, self.allowed_variables)
                == result
            )
