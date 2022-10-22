DROP DATABASE IF EXISTS bard;
CREATE DATABASE bard;

\c bard

CREATE TABLE session_metadata (
  id text PRIMARY KEY,
  startTime bigint NOT NULL,
  endTime bigint,
  lastEventTimestamp bigint NOT NULL
);

INSERT INTO session_metadata VALUES
  ('a', 0, NULL, 34000),
  ('b', 0, NULL, 52000),
  ('c', 0, NULL, 98000),
  ('d', 0, NULL, 86000),
  ('e', 0, NULL, 18000);