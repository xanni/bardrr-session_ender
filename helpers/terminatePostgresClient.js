"use strict";

async function terminatePostgresClient(postgresClient) {
  await postgresClient.end();
}

module.exports = terminatePostgresClient;
