import string

from domain.common.random_string_utils import StringUtils


class TestStringUtils:
    def setup_method(self):
        self.service = StringUtils()

    def test_default_length_for_random_value_generator(self):
        password = self.service.generate_random_value()
        assert len(password) == 32

    def test_custom_length_for_random_value_generator(self):
        password = self.service.generate_random_value(length=16)
        assert len(password) == 16

    def test_password_characters_for_random_value_generator(self):
        password = self.service.generate_random_value()
        assert all(c in string.ascii_letters + string.digits for c in password)

    def test_extract_tablename_from_filename(self):
        assert (
            self.service.extract_tablename_from_filename(filename="csv file@!12.csv")
            == "csv_file12"
        )
