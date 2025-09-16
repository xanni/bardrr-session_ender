"use strict";

async function getEvents(client, session) {
  const query =
    "SELECT event FROM eventDb.eventTable WHERE sessionId = {sessionId: String}";
  const query_params = { sessionId: session.session_id };
  const format = "JSONEachRow";

  const resultSet = await client.query({ query, query_params, format });
  const dataset = await resultSet.json();

  return dataset;
}

module.exports = getEvents;
