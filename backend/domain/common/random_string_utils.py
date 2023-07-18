import string
import random


class StringUtils:
    def generate_random_value(self, length=32):
        characters = string.ascii_letters + string.digits
        password = "".join(random.choice(characters) for _ in range(length))
        return password
