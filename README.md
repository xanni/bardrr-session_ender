# session_ender

## todo
  - try / catch blocks
  - how to run? (cron job? timed loop?)
  - works with other components?

  - how often to run?
  - `MAX_IDLE_TIME`
  - `GRACE_TIME`
  - write tests?
  - wrap into object?

## pseudocode:
  - initialize database clients
  - get expired sessions (i.e. sessions where most recent event happened more than MAX_IDLE_TIME + GRACE_PERIOD ago) from postgres
  - move expired sessions from postgres to clickhouse
    - if session is not in clickhouse (see note below) then try to insert session into clickhouse, if fail then abort move
    - delete session from postgres
  - terminate database clients

  - note: need this check because the expired session might be one that the script has previously tried and failed to move from postgres into clickhouse, specifically one that the script has previously written to clickhouse but failed to delete from postgres

## issues and discussion:
  - re: `MAX_IDLE_TIME + GRACE_TIME`
    - `MAX_IDLE_TIME` has to be in sync with agent
    - `GRACE_TIME` should be... 1 minute?
  - how often to run?
    - continuously? at some interval of time related to `MAX_IDLE_TIME`? unrelated to `MAX_IDLE_TIME`?
    - what's the objective? are sessions hidden from the user until they are complete? if so then the frequency with which we check to close sessions determines how soon sessions are made visible to the user... if not then it just determines how soon session metadata (e.g. end time, length) becomes correctly populated...
