import logging

from fastapi import Depends

from clickhouse.clickhouse import Clickhouse


class ClickHouseRole:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse

    def create_user(self, username: str, password: str):
        query = (
            f"CREATE USER {username} IDENTIFIED WITH plaintext_password BY '{password}'"
        )
        logging.info(f"creating userr {query} ")

        return self.clickhouse.admin.query(query=query)

    def grant_select_permission_to_user(self, username: str):
        granted_tables = ["events", "clickstream"]
        for table in granted_tables:
            query = f"GRANT SELECT ON {table} TO {username};"
            self.clickhouse.admin.query(query=query)

    def create_row_policy(self, datasource_id: str, username: str):
        query = f"CREATE ROW POLICY pol{datasource_id} ON default.events, default.clickstream USING datasource_id='{datasource_id}' TO {username}"

        try:
            logging.info(f"policy execution try : {query} ")
            return self.clickhouse.admin.query(query=query)
        except Exception as e:
            self.clickhouse.admin.query(
                query=f"DROP POLICY IF EXISTS pol{datasource_id} ON default.events, default.clickstream"
            )
            logging.info(f"policy execution except: {query}")

            return self.clickhouse.admin.query(query=query)

    def grant_permission_to_database(self, database_name: str, username: str):
        logging.info(f"granting permission for database{database_name} to {username}")
        query = f"GRANT SHOW, SELECT, INSERT, ALTER, CREATE TABLE, CREATE VIEW, DROP TABLE, DROP VIEW, UNDROP TABLE, TRUNCATE ON {database_name}.* TO {username};"
        return self.clickhouse.admin.query(query=query)

    def create_database_for_app(self, database_name: str):
        logging.info(f"crating databse {database_name}")
        query = f"CREATE DATABASE {database_name}"
        return self.clickhouse.admin.query(query=query)
