import logging
from typing import List
import openai

from domain.spreadsheets.models import AIQuery, WordReplacement


def generate_prompt(text, columns, database, table):
    return f"""
    I have a Clickhouse table called {database}.{table} with columns {", ".join(columns)}
    Generate only a single SQL 'Select' query and no other text using following text '{text}'
    and incase column name have spaces or any special character, wrap it within quotes
    while generating query
    """


def text_to_sql(query: AIQuery) -> str:
    logging.info(f"Generating sql for text: {query.nl_query}")
    prompt = generate_prompt(
        query.nl_query,
        [w.replacement for w in query.word_replacements] + ["timestamp"],
        query.database,
        query.table,
    )
    logging.info(f"GPT prompt: {prompt}")

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You write correct sql queries for only for ClickHouse.",
            },
            {"role": "user", "content": prompt},
        ],
        max_tokens=2048,
        temperature=0.25,
    )
    logging.info(f"GPT response: {response}")
    return (
        response.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
    )
