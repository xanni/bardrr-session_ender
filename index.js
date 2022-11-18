"use strict";

require("dotenv").config();

const initializeDatabaseClients = require('./helpers/initializeDatabaseClients');
const getExpiredSessions = require('./helpers/getExpiredSessions');
const moveMany = require('./helpers/moveMany');
const terminateDatabaseClients = require('./helpers/terminateDatabaseClients');
const cron = require("node-cron");

const GRACE_TIME = 10 * 1000;

async function endExpiredSessions() {
  let postgresClient;
  let clickhouseClient;

  try {
    [postgresClient, clickhouseClient] = await initializeDatabaseClients();
    const expiredSessions = await getExpiredSessions(postgresClient, GRACE_TIME);
    await moveMany(postgresClient, clickhouseClient, expiredSessions);
  } catch (e) {
    console.error(e);
  } finally {
    try {
      await terminateDatabaseClients(postgresClient, clickhouseClient);
    } catch (e) {
      console.error(e);
    }
  }
}

cron.schedule("* * * * *", endExpiredSessions);
