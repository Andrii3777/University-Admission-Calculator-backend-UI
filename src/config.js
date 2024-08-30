const dotenv = require("dotenv");
dotenv.config();

// Environment configuration object
const env = {
  APP_PORT: Number(process.env.APP_PORT),
  API_BASE_PATH: process.env.API_BASE_PATH,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET, // Secret key for signing access tokens
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET, // Secret key for signing refresh tokens

  ACCESS_TOKEN_AGE_SECONDS: Number(process.env.ACCESS_TOKEN_AGE_SECONDS), // Access token lifetime in seconds
  REFRESH_TOKEN_AGE_SECONDS: Number(process.env.REFRESH_TOKEN_AGE_SECONDS), // Refresh token lifetime in seconds

  MYSQL_ROOT_PASSWORD: process.env.MYSQL_ROOT_PASSWORD,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_PORT: Number(process.env.MYSQL_PORT),
  MYSQL_USERNAME: process.env.MYSQL_USERNAME,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
};

module.exports = env;
