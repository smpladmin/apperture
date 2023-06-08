import logging
import re

import sqlvalidator
from sqlglot import condition, exp, parse_one


class BusinessError(Exception):
    pass


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
            raise BusinessError(
                "Invalid query: Cannot select more than 10 columns",
            )

        for field in selected_fields:
            if "*" == field:
                raise BusinessError(
                    "Invalid query: Cannot select * from table",
                )
            if "properties" == field:
                raise BusinessError(
                    "Invalid query: Cannot select properties from table",
                )

    def match_table_name(self, query_string: str, dsId: str, is_sql: bool):
        parsed_query = parse_one(query_string)
        for table in parsed_query.find_all(exp.Table):
            if table.name not in ["events", "clickstream"]:
                raise BusinessError(
                    "Invalid query: Cannot select from table other than event",
                )
        return (
            parsed_query.where(condition(f"datasource_id='{dsId}'")).sql()
            if not is_sql
            else query_string
        )

    def assign_query_limit(self, query_string):
        limit = re.search("LIMIT\s(.\w+)", query_string, re.IGNORECASE)
        if not limit:
            query_string = re.sub("\s*;", "", query_string)
            return query_string + " LIMIT 500"
        else:
            limit = limit.group(1).strip()
            return query_string + " LIMIT 500" if int(limit) > 500 else query_string

    def DML_validation(self, query_string):
        selected_fields_search_pattern = re.compile(
            r"(UPDATE|INSERT|DELETE|TRUNCATE|DROP)", re.IGNORECASE
        )
        if len(re.findall(selected_fields_search_pattern, query_string)):
            raise BusinessError(
                "Invalid query: Cannot update data",
            )

    def validate_query_string(self, query_string: str, dsId: str, is_sql: bool):
        self.DML_validation(query_string=query_string)
        query_string = self.match_table_name(query_string, dsId, is_sql)
        query_string = self.assign_query_limit(query_string)

        return query_string
