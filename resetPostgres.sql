DROP DATABASE IF EXISTS bard;
CREATE DATABASE bard;

\c bard
-- TODO: think about how we know a session is complete.
CREATE TABLE session_metadata (
  session_id text PRIMARY KEY,
  start_time bigint NOT NULL,
  end_time bigint,
  last_event_timestamp bigint NOT NULL
);

INSERT INTO
  session_metadata
VALUES
  ('a', 0, NULL, 56000),
  ('b', 0, NULL, 30000),
  ('c', 0, NULL, 48000),
  ('d', 0, NULL, 21000),
  ('e', 0, NULL, 17000)
;