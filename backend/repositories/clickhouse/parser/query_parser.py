import logging
import re

import sqlvalidator
from sqlglot import condition, exp, parse_one

from utils.errors import BusinessError


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
        table_names = [table.name for table in parsed_query.find_all(exp.Table)]
        if "events" not in table_names and "clickstream" not in table_names:
            raise BusinessError(
                "Invalid query: Cannot select from table other than event",
            )
        return (
            parsed_query.where(condition(f"datasource_id='{dsId}'")).sql()
            if not is_sql
            else query_string
        )

    def count_selected_columns(self, query: str):
        # Use regular expressions to find the SELECT clause and the columns inside it.
        select_match = re.search(r"SELECT (.+?) FROM", query, re.IGNORECASE)

        if select_match:
            # Extract the content inside the SELECT clause.
            select_clause = select_match.group(1)

            # Split the SELECT clause by commas, considering quoted strings.
            selected_columns = []
            for match in re.finditer(r'(?:[^,"]|"(?:\\.|[^"])*")+', select_clause):
                selected_columns.append(match.group().strip())

            num_columns = len(selected_columns)

            return num_columns

        # If no SELECT clause is found, return 0 to indicate no columns are selected.
        return 0

    def assign_query_limit(self, query_string):
        num_cols = self.count_selected_columns(query=query_string)

        # Ignoring if order by already present in query string. Need to fix later.
        if not re.search(r'\bORDER\s+BY\b', query_string, re.IGNORECASE):
            query_string = (
                query_string
                + f" ORDER BY {','.join([str(i) for i in range(1, num_cols + 1)])}"
            )
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
