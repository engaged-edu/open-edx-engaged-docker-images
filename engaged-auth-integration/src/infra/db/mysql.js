const mysql = require('mysql');
const { APP_ERROR_CODE, APP_ERROR_KIND, ERROR_LEVEL } = require('../../constants');

exports.connectToMySQL = ({ ENV, AppError } = {}) => {
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
    } catch (error) {
      return reject(error);
    }
  }).catch((dbError) => {
    throw new AppError({
      error: dbError,
      level: ERROR_LEVEL.FATAL,
      kind: APP_ERROR_KIND.FATAL,
      code: APP_ERROR_CODE.API_MYSQL_CONN_START,
    });
  });
};

exports.terminateMySQL = async ({ mysql: connection, handleTerminationError } = {}) => {
  if (!connection || typeof connection.constructor !== 'function' || connection.constructor.name !== 'Connection') {
    return;
  }
  await new Promise((resolve) => {
    connection.end((connectionError) => {
      if (connectionError) {
        handleTerminationError({ error: connectionError, code: APP_ERROR_CODE.API_MYSQL_TERMINATE });
      }
      return resolve();
    });
  });
  return;
};
