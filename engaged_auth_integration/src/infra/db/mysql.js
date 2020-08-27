const mysql = require('mysql');

exports.connectToMySQL = ({ ENV } = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const connection = mysql.createConnection({
        host: ENV.OPEN_EDX_MYSQL_HOST,
        user: ENV.OPEN_EDX_MYSQL_USERNAME,
        password: ENV.OPEN_EDX_MYSQL_PASSWORD,
        database: ENV.OPEN_EDX_MYSQL_DATABASE,
      });
      connection.connect((connectionError) => {
        if (connectionError) {
          return reject(connectionError);
        }
        return resolve({ mysql: connection });
      });
    } catch (dbError) {
      return reject(dbError);
    }
  });
};

exports.terminateMySQL = async ({ mysql: connection, handleTerminationError } = {}) => {
  if (!connection || typeof connection.constructor !== 'function' || connection.constructor.name !== 'Connection') {
    return;
  }
  await new Promise((resolve) => {
    connection.end((connectionError) => {
      if (connectionError) {
        handleTerminationError({ error: connectionError, code: '' });
      }
      return resolve();
    });
  });
  return;
};
