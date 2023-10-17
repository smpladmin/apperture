from dags.event_processors.clevertap_event_processor import ClevertapEventProcessor
from .clevertap_sample import json


class TestClevertapEventProcessor:
    def setup_method(self):
        self.json = json
        self.processor = ClevertapEventProcessor()
        self.event = "UTM Visited"

    def test_process_dataframe_user_id(self):
        """
        Should pick userId from profile objectId
        """

        df = self.processor.process_dataframe(self.json, self.event)
        assert df.userId.to_list() == [
            "__g9e75e20dcf3d41ee9f1ebd907663164e",
            "__b000383c2bfc4b42841ee3dbe8d479d5",
            "__b000383c2bfc4b42841ee3dbe8d479d5",
            "__b000383c2bfc4b42841ee3dbe8d479d5",
            "__3ac82e25092f4a55ac03ccaf62061024",
            "__g6e63f0463b794876964cf2fb8e0898f4",
        ]

    def test_process_dataframe_timestamp(self):
        """
        Should pick ts as timestamp field
        """

        df = self.processor.process_dataframe(self.json, self.event)
        assert df.timestamp.to_list() == [
            "2022-11-19 05:49:37",
            "2022-11-19 12:11:25",
            "2022-11-19 12:11:55",
            "2022-11-19 12:20:07",
            "2022-11-19 13:08:44",
            "2022-11-19 14:49:33",
        ]

    def test_process_dataframe_event_name(self):
        """
        Should pick eventName which is passed as argument
        """

        df = self.processor.process_dataframe(self.json, self.event)
        assert df.eventName.to_list() == [
            "UTM Visited",
            "UTM Visited",
            "UTM Visited",
            "UTM Visited",
            "UTM Visited",
            "UTM Visited",
        ]

    def test_process_dataframe_properties(self):
        """
        Should keep all the incoming fields in properties field, flattened to the same level with dot separator
        """

        df = self.processor.process_dataframe(self.json, self.event)

        assert set(
            [
                "event_props.Install",
                "profile.app_version",
                "profile.df.0",
                "profile.df.1",
                "profile.df.2",
                "profile.events.App Installed.count",
                "profile.events.App Installed.first_seen",
                "profile.events.App Installed.last_seen",
                "profile.events.App Launched.count",
                "profile.events.App Launched.first_seen",
                "profile.events.App Launched.last_seen",
                "profile.events.App Uninstalled.count",
                "profile.events.App Uninstalled.first_seen",
                "profile.events.App Uninstalled.last_seen",
                "profile.events.Clevertap Setup.count",
                "profile.events.Clevertap Setup.first_seen",
                "profile.events.Clevertap Setup.last_seen",
                "profile.events.Reachable By.count",
                "profile.events.Reachable By.first_seen",
                "profile.events.Reachable By.last_seen",
                "profile.events.Session Concluded.count",
                "profile.events.Session Concluded.first_seen",
                "profile.events.Session Concluded.last_seen",
                "profile.events.UTM Visited.count",
                "profile.events.UTM Visited.first_seen",
                "profile.events.UTM Visited.last_seen",
                "profile.events.ob_education_complete.count",
                "profile.events.ob_education_complete.first_seen",
                "profile.events.ob_education_complete.last_seen",
                "profile.events.ob_first_open.count",
                "profile.events.ob_first_open.first_seen",
                "profile.events.ob_first_open.last_seen",
                "profile.events.ob_otp_requested.count",
                "profile.events.ob_otp_requested.first_seen",
                "profile.events.ob_otp_requested.last_seen",
                "profile.events.ob_otp_resend.count",
                "profile.events.ob_otp_resend.first_seen",
                "profile.events.ob_otp_resend.last_seen",
                "profile.events.ob_otp_verified.count",
                "profile.events.ob_otp_verified.first_seen",
                "profile.events.ob_otp_verified.last_seen",
                "profile.make",
                "profile.model",
                "profile.objectId",
                "profile.os_version",
                "profile.platform",
                "profile.push_token",
                "session_props.session_referrer",
                "session_props.session_source",
                "session_props.utm_medium",
                "session_props.utm_source",
                "ts",
            ]
        ).issubset(set(df["properties"].to_list()[0].keys()))
