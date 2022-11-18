"use strict";

const moveOne = require('./moveOne');

async function moveMany(postgresClient, clickhouseClient, sessions) {
  await Promise.allSettled(sessions.map(session => {
    return moveOne(postgresClient, clickhouseClient, session);
  }));
}

module.exports = moveMany;
