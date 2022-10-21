- iterate over sessions that have started but not yet ended (i.e. the entirety of the intermediary store)
  - query clickhouse for all events for that session that happened with the last X minutes
  - if there are no such events, then end the session
    - select the most recent event for the session
    - update the session's end time to be the timestamp of that event
    - calculate any other outstanding session data (e.g. length)
    - move the session data from the intermediary store to clickhouse atomically
      - what if a session with the same id already exists in clickhouse? the code that starts a session will protect against this


