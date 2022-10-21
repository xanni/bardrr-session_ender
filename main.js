// - pseudocode:
//   - iterate over sessions that have started but not yet ended (i.e. the entirety of the intermediary store)
//     - if last event timestamp is not withing the last X minutes, then end the session
//       - update the session's end time to be the timestamp of the last event
//       - calculate any other outstanding session data (e.g. length)
//       - move the session data from the intermediary store to clickhouse atomically
//         - what if a session with the same id already exists in clickhouse? the code that starts a session will protect against this

"use strict";

require('dotenv').config();
const { Client } = require('pg');
const { createClient } = require("@clickhouse/client");

let postgres;
let clickhouse;

async function main() {
  postgres = await initializePostgres();
  clickhouse = initializeClickhouse();

  // get everything from postgres
  const sessionsToEnd = await getSessionsToEnd();

  await postgres.end();
}

async function initializePostgres() {
  const postgres = new Client();
  await postgres.connect();
  return postgres;
}

function initializeClickhouse() {
  return createClient();
}

async function getSessionsToEnd() {
  postgres.query('SELECT ');
}

