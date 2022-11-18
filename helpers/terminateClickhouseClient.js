"use strict";

async function terminateClickhouseClient(clickhouseClient) {
  await clickhouseClient.close();
}

module.exports = terminateClickhouseClient;
