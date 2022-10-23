/*
todo
  - try / catch blocks
  - how to run? (cron job? timed loop?)
  - how to get MAX_IDLE_TIME and GRACE_TIME?
  - wrap into object?
  - write tests?
*/

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
  await moveMany(expiredSessions);

  await postgresClient.end();
  await clickhouseClient.close();
}

async function initializePostgresClient() {
  const postgresClient = new Client();
  await postgresClient.connect();
  return postgresClient;
}

function initializeClickhouseClient() {
  return createClient();
}

async function getExpiredSessions() {
  const text = 'SELECT * FROM session_metadata WHERE last_event_timestamp < $1';
  // todo
  // const values = [Date.now() - (MAX_IDLE_TIME + GRACE_TIME)];
  const values = [100000 - (MAX_IDLE_TIME + GRACE_TIME)];
  const result = await postgresClient.query(text, values);

  return result.rows;
}

async function moveMany(sessions) {
  await Promise.allSettled(sessions.map(moveOne));
  return;
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
  const query_params = { sessionId: session.session_id };
  const format = 'JSONEachRow';

  let resultSet;
  try {
    resultSet = await clickhouseClient.query({ query, query_params, format });
  } catch (error) {
    throw new Error('error selecting from clickhouse', { cause: error });
  }
  const dataset = await resultSet.json();

  return dataset.length > 0;
}

async function insertIntoClickhouse(session) {
  const table = 'eventDb.sessionTable';
  const values = [
    {
      sessionId: session.session_id,
      startTime: session.start_time,
      endTime: session.last_event_timestamp,
      lengthMs: session.last_event_timestamp - session.start_time,
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
    const text = 'DELETE FROM session_metadata WHERE session_id = $1'
    const values = [session.session_id];
    const result = await postgresClient.query(text, values);
  } catch (error) {
    throw new Error('error deleting from postgres', { cause: error });
  }
}

endExpiredSessions();
