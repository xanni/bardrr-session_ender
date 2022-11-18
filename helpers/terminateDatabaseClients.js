"use strict";

const terminatePostgresClient = require('./terminatePostgresClient');
const terminateClickhouseClient = require('./terminateClickhouseClient');

async function terminateDatabaseClients(postgresClient, clickhouseClient) {
  await terminatePostgresClient(postgresClient);
  await terminateClickhouseClient(clickhouseClient);
}

module.exports = terminateDatabaseClients;
