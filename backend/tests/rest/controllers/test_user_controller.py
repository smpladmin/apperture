def test_get_user(client_init, user_data):
    response = client_init.get("/user/property", params=user_data)
    print(response.json())
    assert response.status_code == 200
    assert response.json() == {
        "userId": "user_id",
        "datasourceId": "datasource_id",
        "property": {
            "$insert_id": "33ba7915-444f-4b91-9541-a49334a5a72e",
            "$insert_key": "006a3255bb6bfa3e095a499cd0e0807c9a#832",
            "$schema": 13,
            "amplitude_id": 502527487487,
            "app": 281811,
            "city": "Lapu-Lapu City",
        },
    }
