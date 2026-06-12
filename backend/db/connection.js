const mysql = require("mysql2/promise");
require("dotenv").config();

const useSsl = process.env.DB_SSL === "true" || process.env.NODE_ENV === "production";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined
});

module.exports = pool;
