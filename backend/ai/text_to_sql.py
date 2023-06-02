import logging
import openai


def generate_prompt(text, ds_id):
    return f"""
    Consider that I have an events table in ClickHouse database with following schema:

    CREATE TABLE events
    (
        datasource_id String,
        timestamp DateTime,
        provider String,
        user_id String,
        event_name String,
        properties JSON
    )
    ENGINE = MergeTree
    ORDER BY timestamp;

    Generate only a ClickHouse SQL query and no other text using following text '{text}'
    
    Note that any column which is not present in the events table would be present in properties column
    because it is a JSON datatype column.

    So for e.g. if the text says 'select user_id and utm_source'.
    The generated sql for this text would be 'SELECT user_id, properties.utm_source FROM events'
    """


def text_to_sql(text: str, datasource_id: str) -> str:
    logging.info(f"Generating sql for text: {text}")
    prompt = generate_prompt(text, datasource_id)
    logging.info(f"GPT prompt: {prompt}")
    response = openai.Completion.create(
        model="text-davinci-003", prompt=prompt, max_tokens=2048, temperature=0.25
    )
    logging.info(f"GPT response: {response}")
    return response.get("choices", [{}])[0].get("text", "").strip()
