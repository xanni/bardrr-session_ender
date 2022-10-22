/*
todo
  - try / catch blocks as needed
  - writing to log?
  - change pg schema - only need id, start_time and most_recent_event_time
*/

// - pseudocode:
//   x- iterate over sessions that have started but not yet ended (i.e. the entirety of the intermediary store)
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

let postgresClient;
let clickhouseClient;

async function endExpiredSessions() {
  postgresClient = await initializePostgresClient();
  clickhouseClient = initializeClickhouseClient();

  const expiredSessions = await getExpiredSessions();
  const moveResults = await moveMany(expiredSessions);

  console.log(moveResults);

  await postgresClient.end();
}

async function initializePostgresClient() {
  const postgres = new Client();
  await postgres.connect();
  return postgres;
}

function initializeClickhouseClient() {
  return createClient();
}

async function getExpiredSessions() {
  const text = 'SELECT * FROM pending_sessions WHERE most_recent_event_time < $1';
  // todo
  // const values = [Date.now() - (MAX_IDLE_TIME + GRACE_TIME)];
  const values = [100000 - (MAX_IDLE_TIME + GRACE_TIME)];
  const result = await postgresClient.query(text, values);

  return result.rows;
}

function moveMany(sessions) {
  return Promise.allSettled(sessions.map(moveOne));
}

async function moveOne(session) {
  try {
    if (await !isInClickhouse(session)) await insertIntoClickhouse(session);
    await deleteFromPostgres(session);
  } catch (error) {
    console.error(new Error('error moving', { cause: error }));
  }
}

async function isInClickhouse(session) {
  const query = 'SELECT * FROM eventDb.sessionTable WHERE sessionId = {sessionId: String}';
  const query_params = { sessionId: session.id }
  const format = 'JSONEachRow'

  const resultSet = await clickhouseClient.query({ query, query_params, format });
  const dataset = await resultSet.json();
  console.log('dataset:', dataset);
  return true;

  // query clickhouse for the session id
  // if get a result back then true, else false
}

function insertIntoClickhouse(session) {
  try {
    console.log('inserting the following into clickhouse:', session);
  } catch (error) {
    throw new Error('error inserting into clickhouse', { cause: error });
  }
}

function deleteFromPostgres(session) {
  try {
    console.log('deleting the following from postgres:', session);
  } catch (error) {
    throw new Error('error deleting from postgres', { cause: error });
  }
}

// { session_id, start_time, last_event_timestamp }

// postgres schema
// session_id text PRIMARY KEY,
// start_time bigint NOT NULL,
// end_time bigint,
// last_event_timestamp bigint NOT NULL

// clickhouse schema:
// sessionId String,
// startTime UInt64,
// endTime UInt64,
// lengthMs UInt64,
// date Date,
// complete Bool

// ('a', 0, NULL, 34000),
// ('b', 0, NULL, 52000),
// ('c', 0, NULL, 98000),
// ('d', 0, NULL, 86000),
// ('e', 0, NULL, 18000);

endExpiredSessions();