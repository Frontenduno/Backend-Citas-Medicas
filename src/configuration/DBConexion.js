require("dotenv").config();
let mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,

  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
});

async function getConnection() {
  return pool.getConnection();
}

async function closeConnection() {
  pool.end();
}

function returnConnection() {
  pool.releaseConnection();
}

module.exports = {
  getConnection,
  closeConnection,
  returnConnection,
};
