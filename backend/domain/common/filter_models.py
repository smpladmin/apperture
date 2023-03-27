import datetime
from enum import Enum
from operator import eq, ge, gt, le, lt, ne


class FilterDataType(Enum):
    STRING = "String"
    NUMBER = "Number"
    DATETIME = "Date"
    BOOL = "True/ False"

    def get_pytype(self):
        type_dict = {
            self.STRING: str,
            self.NUMBER: float,
            self.BOOL: bool,
            self.DATETIME: datetime.datetime,
        }
        return type_dict[self]


class FilterOperatorsString(str, Enum):
    IS = "is"
    IS_NOT = "is not"
    CONTAINS = "contains"
    DOES_NOT_CONTAIN = "does not contain"


class FilterOperatorsNumber(str, Enum):
    EQ = "equals"
    NE = "not equal"
    GT = "greater than"
    GE = "greater than or equal to"
    LT = "less than"
    LE = "less than or equal to"
    BETWEEN = "between"
    NOT_BETWEEN = "not between"

    def get_pyoperator(self):
        type_dict = {
            self.LE: le,
            self.GE: ge,
            self.GT: gt,
            self.LT: lt,
            self.EQ: eq,
            self.NE: ne,
        }
        return type_dict.get(self, eq)


class FilterOperatorsBool(str, Enum):
    T = "is true"
    F = "is false"


class LogicalOperators(str, Enum):
    AND = "and"
    OR = "or"
