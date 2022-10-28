import pprint

from fastapi.testclient import TestClient


class TestBase:
    def setup_method(self, app_init):
        self.test_client = TestClient(app_init)

    def teardown(self, app_init):
        app_init.dependency_overrides = {}
        self.test_client = None
        pprint.pprint(self.test_client.__dict__)
