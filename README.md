<img src="https://github.com/bard-rr/.github/blob/main/profile/logo2.png?raw=true" width="300">
<br/>

[![Version](https://img.shields.io/npm/v/bardrr)](https://www.npmjs.com/package/bardrr)
[![Downloads/week](https://img.shields.io/npm/dt/bardrr)](https://npmjs.org/package/bardrr)
[![License](https://img.shields.io/npm/l/monsoon-load-testing.svg)](https://github.com/minhphanhvu/bardrr/blob/master/package.json)

# Session Ender

<p align="center">
  <img src="https://github.com/bard-rr/.github/blob/main/profile/Session%20Ender.jpg?raw=true" width="600">
</p>

This is a Node.js application that starts a cron job to end active sessions. First, the session ender checks for any sessions in the Postgres database that have ended based on an idle timeout. When the it identifies any sessions that have timed out, it removes the pending session data from the Postgres database and moves it into the Clickhouse database where the data will persist.

## Setup

Clone the open source reposatory from [Here](https://github.com/bard-rr/session_ender). Run the application using:

`npm run start`

## Website

You can read more about our project [here](https://bard-rr.com/).
