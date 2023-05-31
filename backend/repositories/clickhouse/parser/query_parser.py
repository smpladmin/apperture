import re

import sqlvalidator
from sqlglot import condition, parse_one


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

    def match_table_name(self, query_string: str, dsId: str):
        table_name = (
            re.search("from\s(.\w+)", query_string, re.IGNORECASE).group(1).strip()
        )
        if table_name != "events":
            raise BusinessError(
                "Invalid query: Cannot select from table other than event",
            )
        return re.sub(
            r"FROM\s+events",
            f"FROM (SELECT * from events WHERE datasource_id = '{dsId}')",
            query_string,
            flags=re.IGNORECASE,
        )

    def assign_query_limit(self, query_string):
        limit = re.search("LIMIT\s(.\w+)", query_string, re.IGNORECASE)
        if not limit:
            query_string = re.sub("\s*;", "", query_string)
            return query_string + " LIMIT 500"
        else:
            limit = limit.group(1).strip()
            return query_string + " LIMIT 500" if int(limit) > 500 else query_string

    def validate_query_string(self, query_string: str, dsId: str):
        try:
            parsed_query = sqlvalidator.parse(query_string)
            if not parsed_query.is_valid():
                raise BusinessError("DB Error: Invalid query")
        except:
            raise BusinessError("DB Error: Invalid query")
        self.match_select_fields(query_string)
        query_string = self.match_table_name(query_string, dsId)
        print(query_string)
        query_string = self.assign_query_limit(query_string)

        return query_string
