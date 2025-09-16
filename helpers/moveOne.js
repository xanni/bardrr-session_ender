"use strict";

const getEvents = require('./getEvents');
const getIsInClickhouse = require('./getIsInClickhouse');
const insertIntoClickhouse = require('./insertIntoClickhouse');
const deleteFromPostgres = require('./deleteFromPostgres');

async function moveOne(postgresClient, clickhouseClient, session) {
  try {
    const isInClickhouse = await getIsInClickhouse(clickhouseClient, session);
    if (!isInClickhouse) await insertIntoClickhouse(clickhouseClient, session);
    await deleteFromPostgres(postgresClient, session);
    const events = await getEvents(clickhouseClient, session);
    await fs.writeFileSync(`sessions/${session.session_id}.json`, JSON.stringify(events));
  } catch (e) {
    console.error(e);
  }
}

module.exports = moveOne;
