"use strict";

const initializePostgresClient = require('./initializePostgresClient');
const initializeClickhouseClient = require('./initializeClickhouseClient');

async function initializeDatabaseClients() {
  const postgresClient = await initializePostgresClient();
  const clickhouseClient = initializeClickhouseClient();

  return [postgresClient, clickhouseClient];
}

module.exports = initializeDatabaseClients;
