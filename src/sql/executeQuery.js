const fs = require("fs");
const path = require("path");
const { db } = require("./mysqlConnection");

/**
 * Executes SQL commands from a specified file.
 * @param {string} sqlFileName - The name of the SQL file to execute.
 * @param {Array} [fillData] - Optional parameters for SQL queries.
 * @returns {Promise<void>} A promise that resolves when all SQL queries have been executed.
 */
async function executeSQLFile(sqlFileName, fillData) {
  try {
    // Construct the full path to the SQL file
    const sqlFilePath = path.join(__dirname, "./scripts/", sqlFileName);

    const data = await fs.promises.readFile(sqlFilePath, "utf8");

    // Split the file content into individual queries
    const queries = data.split(";").filter((query) => query.trim() !== "");

    // Execute each query
    for (const query of queries) {
      await executeQuery(query, fillData);
    }
  } catch (error) {
    console.error(`Error executing SQL file ${sqlFileName}:`, error);
  }
}

/**
 * Executes a single SQL query using the database connection.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params] - Optional parameters for the SQL query.
 * @returns {Promise<any>} A promise that resolves with the result of the query.
 */
function executeQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
}

module.exports = { executeQuery, executeSQLFile };
