CREATE TABLE events
    (
        datasource_id String,
        timestamp DateTime,
        user_id String,
        provider String,
        event_name String,
        properties JSON
    )
    ENGINE = MergeTree
    ORDER BY timestamp;


CREATE TABLE click_stream
    (
        datasource_id String,
        timestamp DateTime,
        event String,
        user_id String,
        properties JSON,
        elements JSON,
        elements_chain String
    )
    ENGINE = MergeTree
    ORDER BY timestamp;
