const { Pool } = require("pg");

const pool = new Pool({
  host: "postgres",
  user: "admin",
  password: "admin",
  database: "payments",
  port: 5432
});

module.exports = pool;