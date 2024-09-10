const express = require("express");
const path = require("path");
const env = require("./config");
const routes = require("./routes/routes");
const cookieParser = require("cookie-parser");
const createAndFillTables = require("./sql/tablesInfill");
const { createDatabase, connectToDatabase } = require("./sql/mysqlConnection");

const app = express();

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "ejs");

app.use(env.API_BASE_PATH, routes);

(async () => {
  try {
    await createDatabase();
    await connectToDatabase();
    await createAndFillTables();

    app.listen(env.APP_PORT, () => {
      console.log(
        `Server is running: http://localhost:${env.APP_PORT}${env.API_BASE_PATH}`,
      );
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
})();
