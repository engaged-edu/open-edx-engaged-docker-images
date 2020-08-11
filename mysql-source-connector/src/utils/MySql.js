const mysql = require("mysql");

exports.connectToMySQL = () => {
    return new Promise((resolve, reject) => {
        try {
            const connection = mysql.createConnection({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_USER_PASSWORD,
                database: "openedx",
            });
            connection.connect((connectionError) => {
                if (connectionError) {
                    return reject(connectionError);
                }
                return resolve(connection);
            });
        } catch (dbError) {
            return reject(dbError);
        }
    });
};
