"use strict";

async function deleteFromPostgres(client, session) {
  const text = "DELETE FROM pending_sessions WHERE session_id = $1";
  const values = [session.session_id];

  console.log("deleting the following from postgres:", session);
  await client.query(text, values);
}

module.exports = deleteFromPostgres;
