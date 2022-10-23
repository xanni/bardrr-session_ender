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

  await postgresClient.end();
  await clickhouseClient.close();
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
  const isInClickhouse = await getIsInClickhouse(session);
  try {
    if (!isInClickhouse) await insertIntoClickhouse(session);
    await deleteFromPostgres(session);
  } catch (error) {
    console.error(new Error('error moving', { cause: error }));
  }
}

async function getIsInClickhouse(session) {
  const query = 'SELECT * FROM eventDb.sessionTable WHERE sessionId = {sessionId: String}';
  const query_params = { sessionId: session.id }
  const format = 'JSONEachRow'

  let resultSet;
  try {
    resultSet = await clickhouseClient.query({ query, query_params, format });
  } catch (error) {
    throw new Error('error selecting from clickhouse', { cause: error });
  }
  const dataset = await resultSet.json();

  return dataset.length > 0;
}

// clickhouse schema:
// sessionId String,
// startTime UInt64,
// endTime UInt64,
// lengthMs UInt64,
// date Date,
// complete Bool

// let date = this.buildDate(timestamp);
// let query = `
//   INSERT INTO eventDb.sessionTable
//   (sessionId, startTime, date, complete)
//   VALUES
//   ('${sessionId}', ${timestamp}, '${date}', ${false})
// `;
// await this.client.exec({ query });

async function insertIntoClickhouse(session) {
  const table = 'eventDb.sessionTable';
  const values = [
    {
      sessionId: session.id,
      startTime: session.start_time,
      endTime: session.most_recent_event_time,
      lengthMs: session.most_recent_event_time - session.start_time,
      date: buildDate(session.start_time),
      complete: true,
    }
  ];
  const format = 'JSONEachRow';

  try {
    console.log('inserting the following into clickhouse:', values[0]);
    await clickhouseClient.insert({ table, values, format });
  } catch (error) {
    throw new Error('error inserting into clickhouse', { cause: error });
  }
}

function buildDate(timestamp) {
  let dateObj = new Date(timestamp);
  let day = dateObj.getUTCDate();
  let month = dateObj.getUTCMonth() + 1;
  let year = dateObj.getUTCFullYear();
  let finalDate = `${year.toString()}-${month.toString()}-${day.toString()}`;
  return finalDate;
}

async function deleteFromPostgres(session) {
  try {
    console.log('deleting the following from postgres:', session);
    const text = 'DELETE FROM pending_sessions WHERE id = $1'
    const values = [session.id];
    const result = await postgresClient.query(text, values);
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