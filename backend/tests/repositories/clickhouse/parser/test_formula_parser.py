from repositories.clickhouse.parser.formula_parser import FormulaParser
from pypika import Field, functions as fn


class TestFormulaParser:
    def setup_method(self):
        self.parser = FormulaParser()
        self.sum_wrapper = fn.Sum
        self.test_cases = ["A+B", "A-B", "A/B", "A*B", "A*2"]
        self.test_sum_aggregation_results = [
            fn.Sum(Field("A")) + fn.Sum(Field("B")),
            fn.Sum(Field("A")) - fn.Sum(Field("B")),
            fn.Sum(Field("A")) / fn.Sum(Field("B")),
            fn.Sum(Field("A")) * fn.Sum(Field("B")),
            fn.Sum(Field("A")) * 2,
        ]

    def test_parser_for_summation_aggregation(self):
        for test_case, result in zip(
            self.test_cases, self.test_sum_aggregation_results
        ):
            assert self.parser.parse(test_case, self.sum_wrapper) == result
