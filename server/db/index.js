const { Pool } = require("pg");

//Fix when connecting?
const pool = new Pool({
  user: "postgres",
  password: "qsefth=-0",
  host: "localhost",
  port: "5432",
  database: "survey",
});

module.exports = pool;
