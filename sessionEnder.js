"use strict";

require("dotenv").config();
const cron = require("node-cron");
const { Client } = require("pg");
const { createClient } = require("@clickhouse/client");

const MAX_IDLE_TIME = 5 * 1000;
const GRACE_TIME = 5 * 1000;

let postgresClient;
let clickhouseClient;

async function endExpiredSessions() {
  try {
    await initializeDatabaseClients();
  } catch (error) {
    console.error(
      new Error("error initializing database clients", { cause: error })
    );
    await terminateDatabaseClients();
    return;
  }

  try {
    const expiredSessions = await getExpiredSessions();
    await moveMany(expiredSessions);
  } catch (error) {
    console.error(error);
  }

  await terminateDatabaseClients();
}

async function initializeDatabaseClients() {
  postgresClient = await initializePostgresClient();
  clickhouseClient = initializeClickhouseClient();
}

async function initializePostgresClient() {
  const postgresClient = new Client();

  try {
    await postgresClient.connect();
  } catch (error) {
    throw new Error("error connecting to postgres", { cause: error });
  }

  return postgresClient;
}

function initializeClickhouseClient() {
  return createClient();
}

async function getExpiredSessions() {
  const text =
    "SELECT * FROM pending_sessions WHERE most_recent_event_time < $1";

  // totoggle
  const values = [Date.now() - (MAX_IDLE_TIME + GRACE_TIME)];
  //const values = [60000 - (MAX_IDLE_TIME + GRACE_TIME)];

  let result;
  try {
    result = await postgresClient.query(text, values);
  } catch (error) {
    throw new Error("error getting expired sessions", { cause: error });
  }

  return result.rows;
}

async function moveMany(sessions) {
  await Promise.allSettled(sessions.map(moveOne));
}

async function moveOne(session) {
  try {
    const isInClickhouse = await getIsInClickhouse(session);
    if (!isInClickhouse) await insertIntoClickhouse(session);
    await deleteFromPostgres(session);
  } catch (error) {
    console.error(new Error("error moving", { cause: error }));
  }
}

async function getIsInClickhouse(session) {
  const query =
    "SELECT * FROM eventDb.sessionTable WHERE sessionId = {sessionId: String}";
  const query_params = { sessionId: session.session_id };
  const format = "JSONEachRow";

  let resultSet;
  try {
    resultSet = await clickhouseClient.query({ query, query_params, format });
  } catch (error) {
    throw new Error("error selecting from clickhouse", { cause: error });
  }
  const dataset = await resultSet.json();

  return dataset.length > 0;
}

async function insertIntoClickhouse(session) {
  const table = "eventDb.sessionTable";
  const startTime = Number.parseInt(session.start_time, 10);
  const mostRecentEventTime = Number.parseInt(
    session.most_recent_event_time,
    10
  );
  const errorCount = Number.parseInt(session.error_count, 10);
  console.log(session);
  const values = [
    {
      sessionId: session.session_id,
      startTime,
      endTime: mostRecentEventTime,
      lengthMs: mostRecentEventTime - startTime,
      date: buildDate(startTime),
      appName: session.app_name,
      errorCount,
    },
  ];
  const format = "JSONEachRow";

  console.log("inserting the following into clickhouse:", values[0]);
  try {
    await clickhouseClient.insert({ table, values, format });
  } catch (error) {
    throw new Error("error inserting into clickhouse", { cause: error });
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
  const text = "DELETE FROM pending_sessions WHERE session_id = $1";
  const values = [session.session_id];

  console.log("deleting the following from postgres:", session);
  try {
    await postgresClient.query(text, values);
  } catch (error) {
    throw new Error("error deleting from postgres", { cause: error });
  }
}

async function terminateDatabaseClients() {
  await terminatePostgresClient();
  await terminateClickhouseClient();
}

async function terminatePostgresClient() {
  try {
    await postgresClient.end();
  } catch (error) {
    console.error(
      new Error("error terminating postgres client", { cause: error })
    );
  }
}

async function terminateClickhouseClient() {
  try {
    await clickhouseClient.close();
  } catch (error) {
    console.error(
      new Error("error terminating clickhouse client", { cause: error })
    );
  }
}

cron.schedule("* * * * *", endExpiredSessions);
