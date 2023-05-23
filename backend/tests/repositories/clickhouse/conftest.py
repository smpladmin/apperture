import datetime
import pytest

FAKE_TIME = datetime.datetime(2023, 1, 4, 11, 28, 38, 194662)


@pytest.fixture
def patch_datetime_today(monkeypatch):
    class MockDatetime:
        @classmethod
        def today(cls):
            return FAKE_TIME

        @classmethod
        def now(cls):
            return FAKE_TIME

        @classmethod
        def utcnow(cls):
            return FAKE_TIME

    monkeypatch.setattr(datetime, "datetime", MockDatetime)


def test_patch_datetime(patch_datetime_today):
    assert datetime.datetime.today() == FAKE_TIME
    assert datetime.datetime.now() == FAKE_TIME
