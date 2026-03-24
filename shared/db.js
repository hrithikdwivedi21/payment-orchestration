const { Pool } = require("pg");

const config = {
  host: "postgres",
  user: "admin",
  password: "admin",
  database: "payments",
  port: 5432
};

async function connectDB() {

  while (true) {

    try {

      const pool = new Pool(config);

      await pool.query("SELECT 1");

      console.log("Connected to PostgreSQL");

      return pool;

    } catch (err) {

      console.log("Waiting for PostgreSQL...");
      await new Promise(res => setTimeout(res, 3000));

    }

  }

}

module.exports = connectDB;