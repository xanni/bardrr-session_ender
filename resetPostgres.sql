DROP DATABASE IF EXISTS bard;
CREATE DATABASE bard;

\c bard

CREATE TABLE session_metadata (
  session_id text PRIMARY KEY,
  start_time bigint NOT NULL,
  end_time bigint,
  last_event_timestamp bigint NOT NULL
);

INSERT INTO session_metadata VALUES
  ('a', 0, NULL, 34000),
  ('b', 0, NULL, 52000),
  ('c', 0, NULL, 98000),
  ('d', 0, NULL, 86000),
  ('e', 0, NULL, 18000);
