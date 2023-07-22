import logging
from typing import List
import openai

from domain.spreadsheets.models import WordReplacement


def generate_prompt(text):
    return f"""
    Consider that I have an events table in ClickHouse database.

    Generate only a ClickHouse Select SQL query and no other text using following text '{text}'

    So for e.g. if the text says 'select user_id and properties.utm_source'.
    The generated sql for this text would be 'SELECT user_id, properties.utm_source FROM events'
    """


def text_to_sql(text: str, word_replacements: List[WordReplacement]) -> str:
    for replacement in word_replacements:
        text = replacement.apply(text)
    logging.info(f"Generating sql for text: {text}")
    prompt = generate_prompt(text)
    logging.info(f"GPT prompt: {prompt}")
    response = openai.Completion.create(
        model="text-davinci-003", prompt=prompt, max_tokens=2048, temperature=0.25
    )
    logging.info(f"GPT response: {response}")
    return response.get("choices", [{}])[0].get("text", "").strip()
