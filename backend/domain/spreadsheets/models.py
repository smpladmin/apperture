from enum import Enum
from typing import List, Optional, Union

from beanie import PydanticObjectId
from pydantic import BaseModel
from pypika import functions as fn

from repositories.document import Document


class ColumnType(str, Enum):
    COMPUTED_HEADER = "COMPUTED_HEADER"
    QUERY_HEADER = "QUERY_HEADER"
    PADDING_HEADER = "PADDING_HEADER"


class SubHeaderColumnType(str, Enum):
    DIMENSION = "DIMENSION"
    METRIC = "METRIC"


class SpreadsheetType(str, Enum):
    SIMPLE_SHEET = "SIMPLE_SHEET"
    PIVOT_SHEET = "PIVOT_SHEET"
    PIVOT_TABLE = "PIVOT_TABLE"


class SpreadSheetColumn(BaseModel):
    name: str
    type: ColumnType


class SubHeaderColumn(BaseModel):
    name: str
    type: SubHeaderColumnType


class ComputedSpreadsheet(BaseModel):
    data: List[dict]
    headers: List[SpreadSheetColumn]
    sql: str


class WordReplacement(BaseModel):
    word: str
    replacement: str

    def apply(self, text: str):
        return text.replace(self.word, self.replacement)


class AIQuery(BaseModel):
    nl_query: str
    sql: Optional[str]
    word_replacements: List[WordReplacement]
    table: str
    database: str


class Format(BaseModel):
    percent: bool
    decimal: int


class Formatting(BaseModel):
    format: Optional[Format]
    width: Optional[int]


class SpreadSheetChartSeries(BaseModel):
    name: str
    type: str


class SpreadSheetChartType(Enum):
    COLUMN = "COLUMN"


class SpreadSheetCharts(BaseModel):
    timestamp: int
    name: str
    x: Union[int, float]
    y: Union[int, float]
    height: Union[int, float]
    width: Union[int, float]
    series: List[SpreadSheetChartSeries]
    type: SpreadSheetChartType
    xAxis: List[SpreadSheetChartSeries]
    yAxis: List[SpreadSheetChartSeries]


class Spreadsheet(BaseModel):
    name: str
    headers: List[SpreadSheetColumn]
    subHeaders: Optional[List[SubHeaderColumn]]
    is_sql: Optional[bool]
    query: str
    edit_mode: bool = True
    sheet_type: Optional[SpreadsheetType]
    meta: Optional[dict]
    ai_query: Optional[AIQuery]
    column_format: Optional[dict[str, Formatting]]
    charts: Optional[List[SpreadSheetCharts]] = []


class WorkBook(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    spreadsheets: List[Spreadsheet]
    enabled: bool = True

    class Settings:
        name = "workbooks"


class Formula(str, Enum):
    COUNT = "count"
    UNIQUE = "unique"
    COUNTIF = "countif"


class ColumnFilterOperators(str, Enum):
    EQUALS = "="
    NOT_EQUALS = "!="
    GREATER_THAN = ">"
    LESS_THAN = "<"
    GREATER_THAN_OR_EQUALS = ">="
    LESS_THAN_OR_EQUALS = "<="
    IN = "in"
    NOT_IN = "not in"
    CONTAINS = "contains"
    NOT_CONTAINS = "not contains"


class ColumnFilter(BaseModel):
    operator: ColumnFilterOperators
    operand: str
    value: Union[List[int], List[str]]


class MetricDefinition(BaseModel):
    formula: Formula
    filters: List[ColumnFilter] = []


class DimensionDefinition(BaseModel):
    formula: Formula
    property: Optional[str]


class DatabaseClient(Enum):
    MYSQL = "mysql"
    CLICKHOUSE = "clickhouse"
    MSSQL = "mssql"


class SQLQueryResult(BaseModel):
    result_set: List
    column_names: List[str]


class SortingOrder(Enum):
    ASC = "ASC"
    DSC = "DESC"


class AggregateFunction(Enum):
    SUM = "SUM"
    COUNT = "COUNT"

    def get_pypika_function(self):
        type_dict = {self.SUM: fn.Sum, self.COUNT: fn.Count}
        return type_dict.get(self, fn.Sum)


class PivotAxisDetail(BaseModel):
    name: str
    sort_by: str
    order_by: SortingOrder
    show_total: bool


class PivotValueDetail(BaseModel):
    name: str
    function: AggregateFunction
