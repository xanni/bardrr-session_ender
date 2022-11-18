"use strict";

async function getIsInClickhouse(client, session) {
  const query =
    "SELECT * FROM eventDb.sessionTable WHERE sessionId = {sessionId: String}";
  const query_params = { sessionId: session.session_id };
  const format = "JSONEachRow";

  const resultSet = await client.query({ query, query_params, format });
  const dataset = await resultSet.json();

  return dataset.length > 0;
}

module.exports = getIsInClickhouse;
