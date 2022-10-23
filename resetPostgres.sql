DROP DATABASE IF EXISTS bard;
CREATE DATABASE bard;

\c bard

CREATE TABLE IF NOT EXISTS pending_sessions (
  session_id text PRIMARY KEY,
  start_time bigint NOT NULL,
  origin_host text NOT NULL,
  most_recent_event_time bigint NOT NULL
);

INSERT INTO
  pending_sessions
VALUES
  ('a', 0, '0.0.0.0', 56000),
  ('b', 0, '0.0.0.1', 30000),
  ('c', 0, '0.0.0.2', 48000),
  ('d', 0, '0.0.0.3', 21000),
  ('e', 0, '0.0.0.4', 17000)
;
