"use strict";

require("dotenv").config();
const initializePostgresClient = require('./helpers/initializePostgresClient');
const initializeClickhouseClient = require('./helpers/initializeClickhouseClient');
const moveOne = require('./helpers/moveOne');
const cron = require("node-cron");

const GRACE_TIME = 10 * 1000;

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

async function getExpiredSessions() {
  const text = `
    SELECT
      *
    FROM
      pending_sessions
    WHERE
      $1 - most_recent_event_time > max_idle_time + $2
  `;
  const values = [Date.now(), GRACE_TIME];

  let result;
  try {
    result = await postgresClient.query(text, values);
  } catch (error) {
    throw new Error("error getting expired sessions", { cause: error });
  }

  return result.rows;
}

async function moveMany(sessions) {
  await Promise.allSettled(sessions.map(session => {
    return moveOne(postgresClient, clickhouseClient, session);
  }));
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

// cron.schedule("* * * * *", endExpiredSessions);
endExpiredSessions();
