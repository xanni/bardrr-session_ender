const { Client } = require('pg');
const { createClient } = require("@clickhouse/client");

const postgres = new Client();
postgres.connect();

const clickhouse = createClient();

