<img src="https://github.com/bard-rr/.github/blob/main/profile/logo2.png?raw=true" width="300">
<br/>

[![Version](https://img.shields.io/npm/v/bardrr)](https://www.npmjs.com/package/bardrr)
[![Downloads/week](https://img.shields.io/npm/dt/bardrr)](https://npmjs.org/package/bardrr)
[![License](https://img.shields.io/npm/l/monsoon-load-testing.svg)](https://github.com/minhphanhvu/bardrr/blob/master/package.json)

# Session Ender

<p align="center">
  <img src="https://github.com/bard-rr/.github/blob/main/profile/Session%20Ender.jpg?raw=true" width="600">
</p>

This is a Nodejs application that starts a cron job that first checks for any sessions in the Postgres database that have ended based on an idle timeout. When the session ender identifies any sessions that have timed out, it removes the pending sessions from the Postgres Database and moves the metadata into the Clickhouse database where the data will persist.

## Setup

Clone the open source reposatory from [Here](https://github.com/bard-rr/session_ender). Run the application using:

`npm run start`

## Website

You can read more about our project [here](oursupercoolwebsite.com).