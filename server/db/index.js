const { Pool } = require("pg");

//Fix when connecting?
// const pool = new Pool({
//   user: "postgres",
//   password: "",
//   host: "localhost",
//   port: "5432",
//   database: "survey",
// });

const pool = new Pool({
  user: "postgres",
  password: "",
  host: "localhost",
  port: "5432",
  database: "surveyul_Survey System",
});

module.exports = pool;
