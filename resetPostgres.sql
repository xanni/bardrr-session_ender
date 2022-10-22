DROP DATABASE IF EXISTS bard;
CREATE DATABASE bard;

\c bard

CREATE TABLE pending_sessions (
  id text PRIMARY KEY,
  start_time bigint NOT NULL,
  most_recent_event_time bigint NOT NULL
);

INSERT INTO pending_sessions VALUES
  ('a', 0, 34000),
  ('b', 0, 52000),
  ('c', 0, 98000),
  ('d', 0, 86000),
  ('e', 0, 18000);
