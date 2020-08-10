var mysql = require("mysql");
var connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_USER_PASSWORD,
    database: "openedx",
});

connection.connect();

module.exports = connection;
