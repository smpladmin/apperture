import re
import logging

import clickhouse_connect
from tabulate import tabulate

# import pandas as pd

from domain.chat.models import ChatQueries, ReturnType

queries = [
    ChatQueries(
        query="""
            SELECT total_sales FROM (SELECT toDate(properties.data."Order Date") as dt,
                   SUM(properties.data."Total Order Value") as total_sales
            FROM sangeethamobiles_com.sangeetha_sales_api_data
            WHERE dt = yesterday()
            GROUP BY 1)
        """,
        return_type=ReturnType.STRING,
    ),
    ChatQueries(
        query="""
                            SELECT
                                ((output1.total_sales - output2.total_sales) / output2.total_sales) * 100 AS percentage_change
                            FROM (
                                SELECT
                                    toDate(properties.data."Order Date") AS dt,
                                    SUM(properties.data."Total Order Value") AS total_sales
                                FROM
                                    sangeethamobiles_com.sangeetha_sales_api_data
                                WHERE
                                    toDate(properties.data."Order Date") = yesterday()
                                GROUP BY
                                    1
                            ) AS output1
                            CROSS JOIN (
                                SELECT
                                    toDate(properties.data."Order Date") AS dt,
                                    SUM(properties.data."Total Order Value") AS total_sales
                                FROM
                                    sangeethamobiles_com.sangeetha_sales_api_data
                                WHERE
                                    date_diff('day', toDate(properties.data."Order Date"), toDate(now())) = 2
                                GROUP BY
                                    1
                            ) AS output2

                            """,
        return_type=ReturnType.STRING,
    ),
    ChatQueries(
        query="""
                SELECT properties.data."Brand" as brand,
                                SUM(properties.data."Total Order Value") as total_sales
                            FROM sangeethamobiles_com.sangeetha_sales_api_data
                            WHERE toDate(properties.data."Order Date") = toDate(yesterday())
                                AND properties.data."Order Status (OMS)" NOT IN ('System Cancelled', 'Pending Transaction')
                            GROUP BY 1
                            ORDER BY 2 DESC
                            LIMIT 5
            """
    ),
    ChatQueries(
        query="""
            SELECT replaceRegexpOne(CAST(properties.data.`UTM Source` AS String), ',', '') AS source,
                            sum(CASE WHEN toDate(properties.data."Order Date") BETWEEN yesterday() - 15 AND yesterday() THEN properties.data."Total Order Value" END) as sales
                        FROM sangeethamobiles_com.sangeetha_sales_api_data
                        WHERE source <> ''
                        GROUP BY 1
                        ORDER BY 2 DESC
                        LIMIT 3
            """
    ),
    ChatQueries(
        query="""
            SELECT replaceRegexpOne(CAST(properties.data."PIMS ID" AS String), ',', '') AS pims_id,
                   sum(CASE WHEN toDate(properties.data."Order Date") BETWEEN yesterday() - 15 AND yesterday() THEN properties.data."Total Order Value" END) as sales
            FROM sangeethamobiles_com.sangeetha_sales_api_data
            WHERE date_diff('day', toDate(properties.data."Order Date"), toDate(now())) <= {p2}
            GROUP BY 1
            ORDER BY 2 DESC
            LIMIT {p1}
        """
    ),
    ChatQueries(
        query="""SELECT count() FROM clickstream WHERE toDate(timestamp) = yesterday()"""
    ),
    ChatQueries(
        query="""
            SELECT (yest - dbyest) / dbyest *100
            FROM (
                SELECT count() yest
                FROM clickstream
                WHERE toDate(timestamp) = yesterday()
            ) a
            LEFT JOIN (
                SELECT count() dbyest
                FROM clickstream
                WHERE date_diff('day', toDate(timestamp), toDate(now())) = 2
            ) b ON 1 = 1
        """
    ),
    ChatQueries(
        query="""
            SELECT properties.utm_source source,
                   count() visitors_yesterday
            FROM clickstream
            WHERE date_diff('day', toDate(timestamp), toDate(now())) <= 7
                  AND date_diff('day', toDate(timestamp), toDate(now())) > 0
                  AND source <> ''
            GROUP BY 1
            ORDER BY 2 DESC
            LIMIT 5
        """
    ),
    ChatQueries(
        query="SELECT sum((average_cpc * clicks) / 1000000) as spends FROM sangeethamobiles_com.google_ads WHERE date <= yesterday()"
    ),
    ChatQueries(
        query="""
             select (yest-dbyest)/dbyest from ( select date, sum((average_cpc*clicks)/1000000) as yest from sangeethamobiles_com.google_ads where date_diff('day', date ,toDate(now())) = 1 group by 1 )a left join ( select date, sum((average_cpc*clicks)/1000000) as dbyest from sangeethamobiles_com.google_ads where date_diff('day', date ,toDate(now())) = 2 group by 1 )b on 1=1
        """
    ),
]


class ChatRepository:
    def __init__(self):
        self.client = clickhouse_connect.get_client()
        self.queries = []

    def execute(self, query):
        return query
        # return self.client.query(query=query).result_set

    def sales_numbers(self) -> float:
        query = """
            SELECT toDate(properties.data."Order Date") as dt,
                   SUM(properties.data."Total Order Value") as total_sales
            FROM sangeethamobiles_com.sangeetha_sales_api_data
            WHERE dt = yesterday()
            GROUP BY 1
        """
        output = self.execute(query)
        return output

    def delta_sales(self) -> tuple:
        query1 = """
            SELECT toDate(properties.data."Order Date") as dt,
                   SUM(properties.data."Total Order Value") as total_sales
            FROM sangeethamobiles_com.sangeetha_sales_api_data
            WHERE dt = yesterday()
            GROUP BY 1
        """
        query2 = """
            SELECT toDate(properties.data."Order Date") as dt,
                   SUM(properties.data."Total Order Value") as total_sales
            FROM sangeethamobiles_com.sangeetha_sales_api_data
            WHERE date_diff('day', dt, toDate(now())) = 2
            GROUP BY 1
        """
        output1 = self.execute(query1)
        output2 = self.execute(query2)
        delta_percentage = ((output1 - output2) / output2) * 100
        return delta_percentage, "%"

    def brandwise_sales(self):
        query = """
            SELECT properties.data."Brand" as brand,
                   SUM(properties.data."Total Order Value") as total_sales
            FROM sangeethamobiles_com.sangeetha_sales_api_data
            WHERE toDate(properties.data."Order Date") = toDate(yesterday())
                  AND properties.data."Order Status (OMS)" NOT IN ('System Cancelled', 'Pending Transaction')
            GROUP BY 1
            ORDER BY 2 DESC
            LIMIT 5
        """
        output = self.execute(query)
        return output

    def areawise_sales(self):
        query = """
            SELECT replaceRegexpOne(CAST(properties.data.`UTM Source` AS String), ',', '') AS source,
                   sum(CASE WHEN toDate(properties.data."Order Date") BETWEEN yesterday() - 15 AND yesterday() THEN properties.data."Total Order Value" END) as sales
            FROM sangeethamobiles_com.sangeetha_sales_api_data
            WHERE source <> ''
            GROUP BY 1
            ORDER BY 2 DESC
            LIMIT 3
        """
        output = self.execute(query)
        return output

    def top_products_in_ndays(self, p1: int, p2: int):
        query = f"""
            SELECT replaceRegexpOne(CAST(properties.data."PIMS ID" AS String), ',', '') AS pims_id,
                   sum(CASE WHEN toDate(properties.data."Order Date") BETWEEN yesterday() - 15 AND yesterday() THEN properties.data."Total Order Value" END) as sales
            FROM sangeethamobiles_com.sangeetha_sales_api_data
            WHERE date_diff('day', toDate(properties.data."Order Date"), toDate(now())) <= {p2}
            GROUP BY 1
            ORDER BY 2 DESC
            LIMIT {p1}
        """
        output = self.execute(query)
        return output

    def visitors_yesterday(self) -> int:
        query = "SELECT count() FROM clickstream WHERE toDate(timestamp) = yesterday()"
        output = self.execute(query)
        return output

    def delta_visitors_yesterday(self) -> tuple:
        query = """
            SELECT (yest - dbyest) / dbyest
            FROM (
                SELECT count() yest
                FROM clickstream
                WHERE toDate(timestamp) = yesterday()
            ) a
            LEFT JOIN (
                SELECT count() dbyest
                FROM clickstream
                WHERE date_diff('day', toDate(timestamp), toDate(now())) = 2
            ) b ON 1 = 1
        """
        output = self.execute(query)
        delta_percentage = (output * 100, "%")
        return delta_percentage

    def top_traffic_sources_last_week(self):
        query = """
            SELECT properties.utm_source source,
                   count() visitors_yesterday
            FROM clickstream
            WHERE date_diff('day', toDate(timestamp), toDate(now())) <= 7
                  AND date_diff('day', toDate(timestamp), toDate(now())) > 0
                  AND source <> ''
            GROUP BY 1
            ORDER BY 2 DESC
            LIMIT 5
        """
        output = self.execute(query)
        return output

    def ad_spend_yesterday(self) -> float:
        query = "SELECT sum((average_cpc * clicks) / 1000000) as spends FROM sangeethamobiles_com.google_ads WHERE date <= yesterday()"
        output = self.execute(query)
        return output

    def ad_spend_delta(self) -> tuple:
        query = """
            SELECT (yest - dbyest) / dbyest
            FROM (
                SELECT date, sum((average_cpc * clicks) / 1000000) as yest
                FROM sangeethamobiles_com.google_ads
                WHERE date_diff('day', date, toDate(now())) = 1
                GROUP BY 1
            ) a
            LEFT JOIN (
                SELECT date, sum((average_cpc * clicks) / 1000000) as dbyest
                FROM sangeethamobiles_com.google_ads
                WHERE date_diff('day', date, toDate(now())) = 2
                GROUP BY 1
            ) b ON a.date = b.date
        """
        output = self.execute(query)
        delta_percentage = (output * 100, "%")
        return delta_percentage

    # def replace_values(self, values):

    def parse_values(self, key, **kwargs):
        return

    def extract_values(self, text):
        pattern = r"\{\{(\d+)\}\}"  # Matches {{1}}, {{2}}, etc.

        def replace(match):
            value = int(match.group(1))
            logging.info(f"match : {queries[value-1].query}")
            query = queries[value - 1].query
            result = self.client.query(query).result_set
            result = self.client.query(query).result_set
            if len(result) == 1:
                if len(result[0]) == 1:
                    return result[0][0]
            table = "\n" + tabulate(result) + "\n"
            return table.replace(r"\n", "\n")

        result = re.sub(pattern, replace, text)
        return result

    def extract_and_parse_system_message(self, message):
        # extract_params
        result = self.extract_values(text=message)
        # logging.info(f"VALUES: {values}")
        return {"message": message, "result": result}
