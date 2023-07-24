import logging
from typing import List
import openai

from domain.spreadsheets.models import WordReplacement


def generate_prompt(text, columns):
    return f"""
    I have a Clickhouse table called events with columns {", ".join(columns)}
    Generate only a single SQL 'Select' query and no other text using following text '{text}'
    """


def text_to_sql(text: str, word_replacements: List[WordReplacement]) -> str:
    logging.info(f"Generating sql for text: {text}")
    prompt = generate_prompt(
        text, [w.replacement for w in word_replacements] + ["timestamp"]
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
