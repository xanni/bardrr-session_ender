async function getIsInClickhouse(client, session) {
  const query =
    "SELECT * FROM eventDb.sessionTable WHERE sessionId = {sessionId: String}";
  const query_params = { sessionId: session.session_id };
  const format = "JSONEachRow";

  let resultSet;
  try {
    resultSet = await client.query({ query, query_params, format });
  } catch (error) {
    throw new Error("error selecting from clickhouse", { cause: error });
  }
  const dataset = await resultSet.json();

  return dataset.length > 0;
}

module.exports = getIsInClickhouse;
