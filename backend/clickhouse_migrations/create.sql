CREATE TABLE events
    (
        datasource_id String,
        timestamp DateTime,
        provider String,
        event_name String,
        properties JSON,
    )
    ENGINE = MergeTree
    ORDER BY timestamp;
