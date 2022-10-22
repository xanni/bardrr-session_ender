CREATE TABLE IF NOT EXISTS eventDb.sessionTable
(
  sessionId String,
  startTime UInt64,
  endTime UInt64,
  lengthMs UInt64,
  date Date,
  complete Bool
)
ENGINE = MergeTree()
PRIMARY KEY (sessionId)