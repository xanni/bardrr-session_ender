async function deleteFromPostgres(client, session) {
  const text = "DELETE FROM pending_sessions WHERE session_id = $1";
  const values = [session.session_id];

  console.log("deleting the following from postgres:", session);
  try {
    await client.query(text, values);
  } catch (error) {
    throw new Error("error deleting from postgres", { cause: error });
  }
}

module.exports = deleteFromPostgres;
