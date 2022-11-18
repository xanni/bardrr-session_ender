"use strict";

async function getExpiredSessions(postgresClient, GRACE_TIME) {
  const text = `
    SELECT
      *
    FROM
      pending_sessions
    WHERE
      $1 - most_recent_event_time > max_idle_time + $2
  `;
  const values = [Date.now(), GRACE_TIME];

  const result = await postgresClient.query(text, values);

  return result.rows;
}

module.exports = getExpiredSessions;
