import re

import sqlvalidator
from clickhouse_connect.driver.exceptions import DatabaseError
from sqlglot import condition, parse_one


class QueryParser:
    def match_select_fields(self, query_string: str):
        selected_fields_search_pattern = re.compile(
            r"SELECT\s+(.+?)\s+FROM", re.IGNORECASE
        )

        selected_fields = []
        for matches in selected_fields_search_pattern.finditer(query_string):
            matched_string = matches.group(1)
            selected_fields.extend([f.strip() for f in matched_string.split(",")])

        self.validate_selected_fields(selected_fields=selected_fields)
        return selected_fields

    def validate_selected_fields(self, selected_fields: list[str]):
        if len(selected_fields) > 10:
            raise DatabaseError(
                "Invalid query: Cannot select more than 10 columns",
            )

        for field in selected_fields:
            if "*" == field:
                raise DatabaseError(
                    "Invalid query: Cannot select * from table",
                )
            if "properties" == field:
                raise DatabaseError(
                    "Invalid query: Cannot select properties from table",
                )

    def match_table_name(self, query_string: str):
        table_name = (
            re.search("from\s(.\w+)", query_string, re.IGNORECASE).group(1).strip()
        )
        if table_name != "events":
            raise DatabaseError(
                "Invalid query: Cannot select from table other than event",
            )
        return table_name

    def validate_query_string(self, query_string: str, dsId: str):
        try:
            parsed_query = sqlvalidator.parse(query_string)
            if not parsed_query.is_valid():
                raise DatabaseError("DB Error: Invalid query")
        except:
            raise DatabaseError("DB Error: Invalid query")
        self.match_select_fields(query_string)
        self.match_table_name(query_string)

        query_string = (
            parse_one(query_string)
            .where(condition(f"datasource_id='{dsId}'"))
            .limit(1000)
            .sql()
        )

        return query_string
