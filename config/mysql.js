const mysql = require("mysql2/promise");
require("dotenv").config();
const db_config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  timezone: "Z",
  multipleStatements: process.env.DB_MULTIPLE_STATEMENTS,
  connectionLimit: process.env.DB_CONNECTION_LIMIT,
};

module.exports = mysql.createPool(db_config);
