import pandas as pd

from event_processors.amplitude_event_processor import AmplitudeEventProcessor


class TestAmplitudeEventProcessor:
    def setup_method(self):
        json = """
        {"$insert_id":"1e6da68c-718b-4af1-97cc-a9f9e9758342","$insert_key":"0079c7b9fdf93924939db5e63b9a828b79#422","$schema":13,"adid":null,"amplitude_attribution_ids":null,"amplitude_event_type":null,"amplitude_id":384783353938,"app":281811,"city":"Dasmarinas","client_event_time":"2022-11-14 00:57:33.008000","client_upload_time":"2022-11-14 00:57:33.010000","country":"Philippines","data":{"group_ids":{},"group_first_event":{}},"data_type":"event","device_brand":null,"device_carrier":null,"device_family":"Android","device_id":"1963dcf7-085b-48df-b629-4c087db9dcfcR","device_manufacturer":null,"device_model":"Android","device_type":"Android","dma":null,"event_id":129,"event_properties":{"anonymous_id":"6e080903-cd30-408c-8393-5b623388d166","event_source":"new-brwr-frontend","value":"elatanronel@gmail.com","attribute_duplicated":"email","timestamp":"2022-11-14T00:57:32.907Z"},"event_time":"2022-11-14 00:57:33.008000","event_type":"user_duplicated","global_user_properties":{},"group_properties":{},"groups":{},"idfa":null,"ip_address":"112.198.27.2","is_attribution_event":false,"language":"English","library":"amplitude-js/5.2.2","location_lat":null,"location_lng":null,"os_name":"Chrome Mobile","os_version":"107","partner_id":null,"paying":null,"plan":{},"platform":"Web","processed_time":"2022-11-14 00:57:35.949636","region":"Province of Cavite","sample_rate":null,"server_received_time":"2022-11-14 00:57:34.045000","server_upload_time":"2022-11-14 00:57:34.048000","session_id":1668386175074,"source_id":null,"start_version":null,"user_creation_time":"2022-04-04 04:45:04.794000","user_id":"155683","user_properties":{"contact_number":"+639979006615","email_verified":true,"referring_domain":"savii.io","marital_status":"MARRIED","education_level":"HIGH_SCHOOL","utm_source":"customer.io","city_permanent":"Muntinlupa City","first_name":"Aiko","home_phone":"09512163847","gender":"FEMALE","anonymous_id":"99ec434c-9b8f-41ed-801b-8d73cb9cecbc","net_salary":8394,"city_current":"Muntinlupa City","initial_utm_source":"customer.io","email":"aikoelatan1339@gmail.com","user_id":"155683","company":"Extra Ordinaire Janitorial and Manpower Services Inc.","address_permanent":"Putatan","resident_since_current":"2018-07-21","contact_name":"Ronel Caras Elatan","mobile_number":"+639555380718","address_current":"Putatan","zip_code_current":"1772","referrer":"https://savii.io/","resident_type_permanent":"LIVING_WITH_PARENTS","timestamp":"2022-11-11T17:08:49.936998","province_permanent":"Metro Manila","job_level":"RANK_AND_FILE","email_address":"aikoelatan1339@gmail.com","initial_referring_domain":"ph.savii.io","initial_utm_campaign":"Password: Request Reset","zip_code_permanent":"1772","initial_utm_content":"Password: Request Reset","utm_medium":"email_action","event_source":"customer-backend-service","initial_utm_medium":"email_action","initial_referrer":"https://ph.savii.io/home","resident_since_permanent":"2018-07-21","updated_date":1649047502,"employee_id":"HO-20-274","resident_type_current":"LIVING_WITH_PARENTS","basic_salary":9511,"bank_code":"GCH","dependents_number":3,"middle_name":"Aguilar","utm_campaign":"Password: Request Reset","last_name":"Elatan","anonymousId":"99ec434c-9b8f-41ed-801b-8d73cb9cecbc","existing_loans":true,"employment_start_date_current":"2019-10-18","province_current":"Metro Manila","birth_place":"Sta Lucia Sasmuan Pampanga","spouse_first_name":"Ronel Caras Elatan","phone":"+639555380718","employment_type":"REGULAR","utm_content":"Password: Request Reset","created_at":"2022-04-16T12:55:40.395","bank_account_number":"+639555380718","job_title":"CLEANER_OR_MAINTENANCE_OR_SECURITY","relationship":"Husband","id":"155683"},"uuid":"54050f2a-63b7-11ed-ae7f-79799fc6c6bf","version_name":null}
        {"$insert_id":"1b35f648-cffe-4d88-8a40-eface7a2156a","$insert_key":"005f42d45d29d12f0986f77fbdac203fb6#415","$schema":13,"adid":null,"amplitude_attribution_ids":null,"amplitude_event_type":null,"amplitude_id":493722138676,"app":281811,"city":"Bacolod City","client_event_time":"2022-11-14 00:57:32.668000","client_upload_time":"2022-11-14 00:57:32.670000","country":"Philippines","data":{"group_ids":{},"group_first_event":{}},"data_type":"event","device_brand":null,"device_carrier":null,"device_family":"Android","device_id":"228baec7-c011-4682-a3e0-a68600a4a37cR","device_manufacturer":null,"device_model":"Android","device_type":"Android","dma":null,"event_id":255,"event_properties":{"path":"/wcr","anonymous_id":"8295916d-76ce-4f18-a33d-8fbc24a0bd35","name":"/wcr","event_source":"new-brwr-frontend","title":"Borrower Dashboard - Savii.io","url":"https://ph.savii.io/wcr","timestamp":"2022-11-14T00:57:32.629Z"},"event_time":"2022-11-14 00:57:32.668000","event_type":"Viewed /wcr Page","global_user_properties":{},"group_properties":{},"groups":{},"idfa":null,"ip_address":"110.54.228.10","is_attribution_event":false,"language":"English","library":"amplitude-js/5.2.2","location_lat":null,"location_lng":null,"os_name":"Chrome Mobile","os_version":"107","partner_id":null,"paying":null,"plan":{},"platform":"Web","processed_time":"2022-11-14 00:57:37.156242","region":"Province of Negros Occidental","sample_rate":null,"server_received_time":"2022-11-14 00:57:34.186000","server_upload_time":"2022-11-14 00:57:34.189000","session_id":1668387383679,"source_id":null,"start_version":null,"user_creation_time":"2022-11-04 03:05:41.855000","user_id":"509071","user_properties":{"referring_domain":"ph.savii.io","event_source":"customer-backend-service","initial_referrer":"https://savii.io/","first_name":"Jerich Pol","anonymous_id":"8295916d-76ce-4f18-a33d-8fbc24a0bd35","created_date":1667531141,"email":"jerichpol.rebucas25@gmail.com","user_id":"509071","middle_name":"Pastor","last_name":"Rebucas","referrer":"https://ph.savii.io/loan-success","anonymousId":"8295916d-76ce-4f18-a33d-8fbc24a0bd35","timestamp":"2022-11-04T03:08:14.157608","phone":"+639518969928","initial_referring_domain":"savii.io","id":"509071"},"uuid":"54bbcaad-63b7-11ed-9898-eba625fb2db7","version_name":null}
        {"$insert_id":"03876f55-143a-4244-8760-c130cdefec93","$insert_key":"0046311448f062788f0da7ed0cb273235a#786","$schema":13,"adid":null,"amplitude_attribution_ids":null,"amplitude_event_type":null,"amplitude_id":260806950917,"app":281811,"city":"Quezon City","client_event_time":"2022-11-14 00:57:35.755000","client_upload_time":"2022-11-14 00:57:36.329000","country":"Philippines","data":{"group_ids":{},"group_first_event":{}},"data_type":"event","device_brand":null,"device_carrier":null,"device_family":"Android","device_id":"c59601f9-c0d3-4b10-9564-31390014028dR","device_manufacturer":null,"device_model":"Android","device_type":"Android","dma":null,"event_id":7,"event_properties":{"referrer":"https://ph.savii.io/home","path":"/login","anonymous_id":"e5e7785e-13d7-4fa9-aaef-bc9a8c0b780f","name":"/login","event_source":"new-brwr-frontend","url":"https://ph.savii.io/login","timestamp":"2022-11-14T00:57:35.693Z"},"event_time":"2022-11-14 00:57:35.755000","event_type":"Viewed /login Page","global_user_properties":{},"group_properties":{},"groups":{},"idfa":null,"ip_address":"110.54.132.176","is_attribution_event":false,"language":"English","library":"amplitude-js/5.2.2","location_lat":null,"location_lng":null,"os_name":"Chrome Mobile","os_version":"107","partner_id":null,"paying":null,"plan":{},"platform":"Web","processed_time":"2022-11-14 00:57:39.114864","region":"Metro Manila","sample_rate":null,"server_received_time":"2022-11-14 00:57:36.837000","server_upload_time":"2022-11-14 00:57:36.841000","session_id":1668387333422,"source_id":null,"start_version":null,"user_creation_time":"2021-05-14 09:59:42.047000","user_id":"95852","user_properties":{"contact_number":"+639451924242","email_verified":true,"referring_domain":"ph.savii.io","marital_status":"SINGLE","education_level":"HIGH_SCHOOL","city_permanent":"Binangonan","first_name":"Jade","home_phone":"00000000","gender":"MALE","anonymous_id":"3363c400-3e6c-46c2-bcd9-a7d4d0419b84","office_phone":"00000000","net_salary":13619,"city_current":"Binangonan","credit_cards_number":0,"email":"magallanesjade501@gmail.com","user_id":"95852","company":"EEI - Corp - Project Workers - Weekly","address_permanent":"Tagpos","resident_since_current":"2000-05-18","contact_name":"Kristian Teraytay","mobile_number":"+639066011051","address_current":"Tagpos","zip_code_current":"1940","referrer":"https://ph.savii.io/home","resident_type_permanent":"OWNER_UNMORTGAGED","timestamp":"2022-11-14T00:56:20.682192","province_permanent":"Rizal","job_level":"ENTRY_LEVEL","email_address":"magallanesjade501@gmail.com","initial_referring_domain":"savii.io","mothers_maiden_name":"Riza Aguilar Vijar","zip_code_permanent":"1940","event_source":"customer-backend-service","initial_referrer":"https://savii.io/","car_owner":false,"resident_since_permanent":"2000-05-18","updated_date":1620986379,"employee_id":"105393","resident_type_current":"OWNER_UNMORTGAGED","basic_salary":14328,"bank_code":"GCH","dependents_number":0,"middle_name":"Vijar","last_name":"Magallanes","anonymousId":"3363c400-3e6c-46c2-bcd9-a7d4d0419b84","existing_loans":false,"employment_start_date_current":"2018-04-10","province_current":"Rizal","birth_place":"Binangonan Rizal","phone":"+639066011051","employment_type":"PROJECT_BASED","created_at":"2022-04-10T10:08:26.795","job_title":"CONSTRUCTION_WORKER","bank_account_number":"+639066011051","relationship":"Colluege","id":"95852"},"uuid":"55ee15d9-63b7-11ed-ba50-e352405c05d2","version_name":null}
        {"$insert_id":"e85a1119-d733-4994-824f-5f0c5b0902fa","$insert_key":"0032e51564e0c3541657c37e561dde72a6#908","$schema":13,"adid":null,"amplitude_attribution_ids":null,"amplitude_event_type":null,"amplitude_id":479630850376,"app":281811,"city":"Makati City","client_event_time":"2022-11-14 00:57:36.233000","client_upload_time":"2022-11-14 00:57:36.235000","country":"Philippines","data":{"group_ids":{},"group_first_event":{}},"data_type":"event","device_brand":null,"device_carrier":null,"device_family":"Android","device_id":"df5d68a5-8fe6-4e78-b5f9-abe6813d5c38R","device_manufacturer":null,"device_model":"Android","device_type":"Android","dma":null,"event_id":71,"event_properties":{"document_name":"Government ID","anonymous_id":"2b99e09f-5b16-44b7-a5e6-3bf5d40db81b","event_source":"new-brwr-frontend","application_id":"SAVII/PHL/LNA/2022/11/534968","timestamp":"2022-11-14T00:57:36.137Z"},"event_time":"2022-11-14 00:57:36.233000","event_type":"upload_file_bottom_sheet_viewed","global_user_properties":{},"group_properties":{},"groups":{},"idfa":null,"ip_address":"103.5.3.222","is_attribution_event":false,"language":"English","library":"amplitude-js/5.2.2","location_lat":null,"location_lng":null,"os_name":"Chrome Mobile","os_version":"103","partner_id":null,"paying":null,"plan":{},"platform":"Web","processed_time":"2022-11-14 00:57:38.958601","region":"Metro Manila","sample_rate":null,"server_received_time":"2022-11-14 00:57:37.262000","server_upload_time":"2022-11-14 00:57:37.265000","session_id":1668386811110,"source_id":null,"start_version":null,"user_creation_time":"2022-10-13 15:21:01.934000","user_id":"503396","user_properties":{"referring_domain":"ph.savii.io","event_source":"customer-backend-service","initial_referrer":"https://ph.savii.io/login","first_name":"Cristina","anonymous_id":"2b99e09f-5b16-44b7-a5e6-3bf5d40db81b","created_date":1665996476,"email":"Iamsolemn_29@yahoo.com","user_id":"503396","middle_name":"Conde","last_name":"Non","referrer":"https://ph.savii.io/wizard/verification-documents","anonymousId":"2b99e09f-5b16-44b7-a5e6-3bf5d40db81b","timestamp":"2022-11-08T11:36:49.676864","phone":"+639952906215","initial_referring_domain":"ph.savii.io","id":"503396"},"uuid":"55db5aa4-63b7-11ed-8f90-9b7685380925","version_name":null}
        {"$insert_id":"f86c2304-40dd-4ebd-be08-a2371b4c29ca","$insert_key":"0019365025f9a5325eb5bd326f22ab7a8a#563","$schema":13,"adid":null,"amplitude_attribution_ids":null,"amplitude_event_type":null,"amplitude_id":500647297285,"app":281811,"city":"Bacolod City","client_event_time":"2022-11-14 00:57:35.597000","client_upload_time":"2022-11-14 00:57:35.599000","country":"Philippines","data":{"group_ids":{},"group_first_event":{}},"data_type":"event","device_brand":null,"device_carrier":null,"device_family":"Android","device_id":"ee879b50-e9bf-404a-9549-7e2093ee3cadR","device_manufacturer":null,"device_model":"Android","device_type":"Android","dma":null,"event_id":5,"event_properties":{"login_id":"unicornrainbow970@gmail.com","user_id":"182256","anonymous_id":"9e16d7b5-9f57-4127-a1d5-99825000116e","event_source":"new-brwr-frontend","type":"email","timestamp":"2022-11-14T00:57:34.779Z"},"event_time":"2022-11-14 00:57:35.597000","event_type":"user_login","global_user_properties":{},"group_properties":{},"groups":{},"idfa":null,"ip_address":"110.54.228.232","is_attribution_event":false,"language":"English","library":"amplitude-js/5.2.2","location_lat":null,"location_lng":null,"os_name":"Chrome Mobile","os_version":"96","partner_id":null,"paying":null,"plan":{},"platform":"Web","processed_time":"2022-11-14 00:57:39.031579","region":"Province of Negros Occidental","sample_rate":null,"server_received_time":"2022-11-14 00:57:37.458000","server_upload_time":"2022-11-14 00:57:37.459000","session_id":1668387395392,"source_id":null,"start_version":null,"user_creation_time":"2022-11-14 00:56:35.427000","user_id":null,"user_properties":{"referring_domain":"savii.io","referrer":"https://savii.io/","initial_referrer":"https://savii.io/","initial_referring_domain":"savii.io"},"uuid":"55e05328-63b7-11ed-9dc2-73b080874b95","version_name":null}
        """
        self.agg_df = pd.read_json(json, lines=True)
        self.processor = AmplitudeEventProcessor()

    def test_process_dataframe_user_id(self):
        """
        Should pick userId from device_id field if user_id is null
        """

        df = self.processor.process_dataframe(self.agg_df)
        assert df.userId.to_list() == [
            "155683",
            "509071",
            "95852",
            "503396",
            "ee879b50-e9bf-404a-9549-7e2093ee3cadR",
        ]

    def test_process_dataframe_timestamp(self):
        """
        Should pick event_time as timestamp field
        """

        df = self.processor.process_dataframe(self.agg_df)
        assert df.timestamp.to_list() == [
            pd.Timestamp("2022-11-14 00:57:33.008000"),
            pd.Timestamp("2022-11-14 00:57:32.668000"),
            pd.Timestamp("2022-11-14 00:57:35.755000"),
            pd.Timestamp("2022-11-14 00:57:36.233000"),
            pd.Timestamp("2022-11-14 00:57:35.597000"),
        ]

    def test_process_dataframe_event_name(self):
        """
        Should pick event_type as eventName field
        """

        df = self.processor.process_dataframe(self.agg_df)
        assert df.eventName.to_list() == [
            "user_duplicated",
            "Viewed /wcr Page",
            "Viewed /login Page",
            "upload_file_bottom_sheet_viewed",
            "user_login",
        ]

    def test_process_dataframe_properties(self):
        """
        Should keep all the incoming fields in properties field, flattened to the same level with dot separator
        """

        df = self.processor.process_dataframe(self.agg_df)
        assert set(
            [
                "app",
                "city",
                "country",
                "data.group_ids",
                "data.group_first_event",
                "data_type",
                "device_brand",
                "device_carrier",
                "device_family",
                "device_id",
                "device_manufacturer",
                "device_model",
                "device_type",
                "dma",
                "event_id",
                "event_properties.anonymous_id",
                "event_properties.event_source",
                "event_properties.value",
                "event_properties.attribute_duplicated",
                "event_properties.timestamp",
                "event_time",
                "event_type",
                "ip_address",
                "is_attribution_event",
                "language",
                "location_lat",
                "location_lng",
                "os_name",
                "os_version",
                "partner_id",
                "paying",
                "plan",
                "platform",
                "processed_time",
                "region",
                "sample_rate",
                "server_received_time",
                "server_upload_time",
                "session_id",
                "source_id",
                "start_version",
                "user_creation_time",
                "user_id",
                "user_properties.contact_number",
                "user_properties.email_verified",
                "user_properties.referring_domain",
                "user_properties.marital_status",
                "user_properties.education_level",
                "user_properties.utm_source",
                "user_properties.city_permanent",
                "user_properties.first_name",
                "user_properties.home_phone",
                "user_properties.gender",
                "user_properties.anonymous_id",
                "user_properties.net_salary",
                "user_properties.city_current",
                "user_properties.initial_utm_source",
                "user_properties.email",
                "user_properties.user_id",
                "user_properties.company",
                "user_properties.address_permanent",
                "user_properties.resident_since_current",
                "user_properties.contact_name",
                "user_properties.mobile_number",
                "user_properties.address_current",
                "user_properties.zip_code_current",
                "user_properties.referrer",
                "user_properties.resident_type_permanent",
                "user_properties.timestamp",
                "user_properties.province_permanent",
                "user_properties.job_level",
                "user_properties.email_address",
                "user_properties.initial_referring_domain",
                "user_properties.initial_utm_campaign",
                "user_properties.zip_code_permanent",
                "user_properties.initial_utm_content",
                "user_properties.utm_medium",
                "user_properties.event_source",
                "user_properties.initial_utm_medium",
                "user_properties.initial_referrer",
                "user_properties.resident_since_permanent",
                "user_properties.updated_date",
                "user_properties.employee_id",
                "user_properties.resident_type_current",
                "user_properties.basic_salary",
                "user_properties.bank_code",
                "user_properties.dependents_number",
                "user_properties.middle_name",
                "user_properties.utm_campaign",
                "user_properties.last_name",
                "user_properties.anonymousId",
                "user_properties.existing_loans",
                "user_properties.employment_start_date_current",
                "user_properties.province_current",
                "user_properties.birth_place",
                "user_properties.spouse_first_name",
                "user_properties.phone",
                "user_properties.employment_type",
                "user_properties.utm_content",
                "user_properties.created_at",
                "user_properties.bank_account_number",
                "user_properties.job_title",
                "user_properties.relationship",
                "user_properties.id",
                "uuid",
                "version_name",
                "event_properties.path",
                "event_properties.name",
                "event_properties.title",
                "event_properties.url",
                "user_properties.created_date",
                "event_properties.referrer",
                "user_properties.office_phone",
                "user_properties.credit_cards_number",
                "user_properties.mothers_maiden_name",
                "user_properties.car_owner",
                "event_properties.document_name",
                "event_properties.application_id",
                "event_properties.login_id",
                "event_properties.user_id",
                "event_properties.type",
            ]
        ).issubset(set(df.properties.to_list()[0].keys()))
