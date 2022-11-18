"use strict";

const buildDate = require('./buildDate');

async function insertIntoClickhouse(client, session) {
  const table = "eventDb.sessionTable";
  const startTime = Number.parseInt(session.start_time, 10);
  const mostRecentEventTime = Number.parseInt(
    session.most_recent_event_time,
    10
  );
  const errorCount = Number.parseInt(session.error_count, 10);
  const values = [
    {
      sessionId: session.session_id,
      startTime,
      endTime: mostRecentEventTime,
      lengthMs: mostRecentEventTime - startTime,
      date: buildDate(startTime),
      appName: session.app_name,
      errorCount,
    },
  ];
  const format = "JSONEachRow";

  console.log("inserting the following into clickhouse:", values[0]);
  await client.insert({ table, values, format });
}

module.exports = insertIntoClickhouse;
