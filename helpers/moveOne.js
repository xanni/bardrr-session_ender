"use strict";

const getIsInClickhouse = require('./getIsInClickhouse');
const insertIntoClickhouse = require('./insertIntoClickhouse');
const deleteFromPostgres = require('./deleteFromPostgres');

async function moveOne(postgresClient, clickhouseClient, session) {
  try {
    const isInClickhouse = await getIsInClickhouse(clickhouseClient, session);
    if (!isInClickhouse) await insertIntoClickhouse(clickhouseClient, session);
    await deleteFromPostgres(postgresClient, session);
  } catch (e) {
    console.error(e);
  }
}

module.exports = moveOne;
