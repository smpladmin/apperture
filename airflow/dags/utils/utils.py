import re


def replace_invalid_characters(input_string):
    pattern = r"[^a-zA-Z0-9\-\._]+"
    replaced_string = re.sub(pattern, "_", input_string)
    return replaced_string
