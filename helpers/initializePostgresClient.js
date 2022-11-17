const { Client } = require("pg");

async function initializePostgresClient() {
  const postgresClient = new Client();

  try {
    await postgresClient.connect();
  } catch (error) {
    throw new Error("error connecting to postgres", { cause: error });
  }

  return postgresClient;
}

module.exports = initializePostgresClient;
