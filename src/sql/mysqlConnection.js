const mysql = require('mysql');
const env = require('../config');

const mysqlOptions = {
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USERNAME,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE
}

const db = mysql.createPool({
    connectionLimit: 5,
    ...mysqlOptions,
    multipleStatements: true
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to MySQL successfully!');
        connection.release();
    }
});

module.exports = db;