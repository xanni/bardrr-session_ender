DROP DATABASE IF EXISTS bard;
CREATE DATABASE bard;

\c bard

CREATE TABLE pending_sessions (
  id text PRIMARY KEY,
  start_time bigint NOT NULL,
  most_recent_event_time bigint NOT NULL
);
