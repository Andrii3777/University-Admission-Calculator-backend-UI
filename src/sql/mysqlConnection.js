const mysql = require("mysql");
const { promisify } = require("util");
const env = require("../config");
const queries = require("./sqlQueries");

const mysqlOptions = {
  host: env.MYSQL_HOST,
  port: env.MYSQL_PORT,
  user: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
};

async function createDatabase() {
  const connection = mysql.createConnection(mysqlOptions);
  const query = promisify(connection.query).bind(connection);

  try {
    await query(queries.createDatabase);
    console.log(`Database checked/created successfully.`);
  } catch (err) {
    console.error("Error creating database:", err);
    throw err;
  } finally {
    connection.end();
  }
}

const db = mysql.createPool({
  connectionLimit: 5,
  ...mysqlOptions,
  database: env.MYSQL_DATABASE,
  multipleStatements: true,
});

async function connectToDatabase() {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to database:", err);
    } else {
      console.log("Connected to MySQL db successfully.");
      connection.release();
    }
  });
}

module.exports = {
  db,
  createDatabase,
  connectToDatabase,
};
