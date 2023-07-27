import os
import string
import random


class StringUtils:
    def generate_random_value(self, length=32):
        characters = string.ascii_letters + string.digits
        password = "".join(random.choice(characters) for _ in range(length))
        return password

    def extract_tablename_from_filename(self, filename: str) -> str:
        file_name_without_extension = os.path.splitext(filename)[0]
        file_name_without_extension = file_name_without_extension.strip()

        translator = str.maketrans("", "", string.punctuation)
        tablename_without_punctuations = file_name_without_extension.translate(
            translator
        )
        tablename = "_".join(tablename_without_punctuations.split())

        return tablename
