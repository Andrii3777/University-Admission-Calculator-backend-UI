const queries = require("./sqlQueries");
const { executeQuery, executeSQLFile } = require("./executeQuery");

/**
 * Creates and fills tables in the database.
 * Executes the table creation script followed by
 * the table filling script if the tables are empty.
 */
async function createAndFillTables() {
  try {
    await createTables();
    await fillTables();
  } catch (error) {
    console.error("Error creating and filling tables:", error);
  }
}

/**
 * Executes the script to create tables in the database.
 */
async function createTables() {
  try {
    await executeSQLFile("createTables.sql");
    console.log("Tables created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

/**
 * Executes the script to fill tables with initial data if the tables are empty.
 */
async function fillTables() {
  try {
    if (await areTablesEmpty()) {
      console.log("Tables are empty, proceeding to fill them.");
      await executeSQLFile("fillTables.sql");
      console.log("Tables filled successfully.");
    } else {
      console.log("Tables are already filled.");
    }
  } catch (error) {
    console.error("Error filling tables:", error);
  }
}

/**
 * Checks if the tables are empty.
 */
async function areTablesEmpty() {
  try {
    const [{ count: rowsInSpecialityTable }] = await executeQuery(
      queries.checkIfEmtySpecialityTable,
    );
    const [{ count: rowsInSpecialtyExamCoefTable }] = await executeQuery(
      queries.checkIfEmtySpecialtyExamCoefficientTable,
    );

    return rowsInSpecialityTable === 0 && rowsInSpecialtyExamCoefTable === 0;
  } catch (error) {
    console.error("Error checking if tables are empty:", error);
    return false; // Assume tables are not empty if an error occurs
  }
}

module.exports = createAndFillTables;
