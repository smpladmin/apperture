import pprint

from tests.rest.test_base import TestBase


class TestNotificationController(TestBase):

    def test_get_notification(self, notification_response):
        response = self.test_client.get("/notifications/?name=name")
        pprint.pprint(self.test_client.__dict__)
        assert response.status_code == 200
        assert response.json().keys() == notification_response.keys()

