"use strict";

function buildDate(timestamp) {
  let dateObj = new Date(timestamp);
  let day = dateObj.getUTCDate();
  let month = dateObj.getUTCMonth() + 1;
  let year = dateObj.getUTCFullYear();
  let finalDate = `${year.toString()}-${month.toString()}-${day.toString()}`;
  return finalDate;
}

module.exports = buildDate;
