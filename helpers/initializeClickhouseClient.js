const { createClient } = require("@clickhouse/client");

function initializeClickhouseClient() {
  return createClient({ host: `http://${process.env.CLICKHOUSE_HOST}:8123` });
}

module.exports = initializeClickhouseClient;
