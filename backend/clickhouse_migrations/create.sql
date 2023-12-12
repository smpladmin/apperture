CREATE TABLE events (
    datasource_id String,
    timestamp DateTime,
    provider String,
    user_id String,
    event_name String,
    properties JSON
) ENGINE = MergeTree
ORDER BY
    timestamp;

CREATE TABLE clickstream (
    datasource_id String,
    timestamp DateTime,
    user_id String,
    element_chain String,
    event String,
    properties JSON
) ENGINE = MergeTree
ORDER BY
    timestamp;

CREATE TABLE errorstream (
    datasource_id String,
    timestamp DateTime,
    user_id String,
    element_chain String,
    event String,
    properties String
) ENGINE = MergeTree
ORDER BY
    timestamp;

CREATE TABLE tata_ivr_events (
    id String,
    timestamp DateTime,
    datasource_id String,
    call_id String,
    uuid String,
    date String,
    time String,
    end_stamp DateTime,
    missed_agents String,
    status String,
    direction String,
    call_duration Int,
    answered_seconds Int,
    minutes_consumed Int,
    broadcast_id String,
    dtmf_input String,
    client_number String,
    hangup_cause String,
    did_number String,
    contact_details String,
    recording_url String,
    service String,
    properties JSON,
) ENGINE = MergeTree
ORDER BY
    timestamp