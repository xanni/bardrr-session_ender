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
  ('a', 0, NULL, 34),
  ('b', 1, NULL, 52),
  ('c', 2, NULL, 98),
  ('d', 3, NULL, 71),
  ('e', 4, NULL, 18);