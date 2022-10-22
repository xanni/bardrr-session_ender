/*
todo
  - try / catch blocks as needed
*/

// - pseudocode:
//   - iterate over sessions that have started but not yet ended (i.e. the entirety of the intermediary store)
//     - if last event timestamp is not within the last X minutes, then end the session
//       - update the session's end time to be the timestamp of the last event
//       - calculate any other outstanding session data (e.g. length)
//       - move the session data from the intermediary store to clickhouse atomically
//         - what if a session with the same id already exists in clickhouse? the code that starts a session will protect against this

"use strict";

require('dotenv').config();
const { Client } = require('pg');
const { createClient } = require("@clickhouse/client");

const MAX_IDLE_TIME = 10 * 1000;
const GRACE_TIME = 5 * 1000;

let postgres;
let clickhouse;

async function main() {
  postgres = await initializePostgres();
  clickhouse = initializeClickhouse();

  const expiredSessionIds = await getExpiredSessionIds();
  console.log(expiredSessionIds);

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

// ('a', 0, NULL, 34000),
// ('b', 0, NULL, 52000),
// ('c', 0, NULL, 98000),
// ('d', 0, NULL, 86000),
// ('e', 0, NULL, 18000);

async function getExpiredSessionIds() {
  const text = 'SELECT id FROM session_metadata WHERE lastEventTimestamp < $1';
  // todo
  // const values = [Date.now() - (MAX_IDLE_TIME + GRACE_TIME)];
  const values = [100000 - (MAX_IDLE_TIME + GRACE_TIME)];
  const result = await postgres.query(text, values);
  return result.rows.map(({ id }) => id);
}

main();