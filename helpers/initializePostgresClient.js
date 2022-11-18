"use strict";

const { Client } = require("pg");

async function initializePostgresClient() {
  const postgresClient = new Client();
  await postgresClient.connect();

  return postgresClient;
}

module.exports = initializePostgresClient;
