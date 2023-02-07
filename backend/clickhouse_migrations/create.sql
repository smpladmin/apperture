CREATE TABLE events
    (
        datasource_id String,
        timestamp DateTime,
        user_id String,
        provider String,
        event_name String,
        properties JSON,
    )
    ENGINE = MergeTree
    ORDER BY timestamp;

CREATE TABLE clickstream
    (
        datasource_id String,
        timestamp DateTime,
        user_id String,
        element_chain String,
        event String,
        properties JSON,
    )
    ENGINE = MergeTree
    ORDER BY timestamp;
