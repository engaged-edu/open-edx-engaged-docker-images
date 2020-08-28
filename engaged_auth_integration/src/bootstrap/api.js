const { BOOTSTRAP_MODE, ERROR_LEVEL, APP_ERROR_MESSAGE, APP_ERROR_CODE } = require('../constants');
const { loadEnvironmentVariables } = require('../infra/config');
const { startLog } = require('../infra/logger');
const { configAppError } = require('../infra/error');

const { connectToMySQL, terminateMySQL } = require('../infra/db/mysql');

const { fetchUserFromOpenEdxFactory } = require('../domain/services/fetch-user-from-open-edx');

const container = async () => {
  let ContainerError, containerLogger, containerMySQL;

  const handleTerminationError = ({ error, code } = {}) => {
    const message = APP_ERROR_MESSAGE[code];
    if (ContainerError) {
      new ContainerError({
        code,
        error,
        level: ERROR_LEVEL.FATAL,
      }).flush();
    } else if (containerLogger) {
      containerLogger.fatal({
        error_code: code,
        error_message: message,
        error_origin_name: error.name,
        error_origin_message: error.message,
      });
    } else {
      console.log(
        JSON.stringify({
          level: ERROR_LEVEL.FATAL,
          error_code: code,
          error_message: message,
          error_origin_name: error.name,
          error_origin_message: error.message,
        }),
      );
    }
  };

  const terminateContainer = async ({ code = 2 } = {}) => {
    try {
      await terminateMySQL({ mysql: containerMySQL, handleTerminationError });
    } catch (onCloseConnError) {
      if (onCloseConnError instanceof Error) {
        handleTerminationError({
          error: onCloseConnError,
          code: APP_ERROR_CODE.API_END_APPLICATION,
        });
      } else {
        handleTerminationError({
          error: new Error('unknown error during container termination'),
          code: APP_ERROR_CODE.API_END_APPLICATION_UNKNOWN,
        });
      }
    }
    process.exit(code);
  };

  process.on('exit', () => {
    console.log(JSON.stringify({ message: 'Application exiting' }));
  });
  ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      terminateContainer({ code: 0 });
    });
  });
  process.on('uncaughtException', async function (uncaughtError) {
    handleTerminationError({ error: uncaughtError, code: APP_ERROR_CODE.API_UNCAUGHT_EXCEPTION });
    terminateContainer({ code: 1 });
  });

  try {
    const { ENV } = loadEnvironmentVariables({ bootstrapMode: BOOTSTRAP_MODE.API });

    const { logger } = startLog({ ENV });
    containerLogger = logger;

    const { AppError } = configAppError({ logger });
    ContainerError = AppError;

    const { mysql } = await connectToMySQL({ ENV }).catch((mysqlConnectionError) => {
      throw new AppError({
        level: ERROR_LEVEL.FATAL,
        error: mysqlConnectionError,
        code: APP_ERROR_CODE.API_MYSQL_CONN_START,
      });
    });
    containerMySQL = mysql;

    const { fetchUsersFromOpenEdx } = fetchUserFromOpenEdxFactory({ mysql, AppError });
  } catch (containerBootstrapError) {
    if (containerBootstrapError instanceof Error) {
      handleTerminationError({
        code: APP_ERROR_CODE.API_APPLICATION,
        error: containerBootstrapError,
      });
    } else {
      handleTerminationError({
        code: APP_ERROR_CODE.API_APPLICATION_UNKNOWN,
        error: new Error('unexpected container error'),
      });
    }
    terminateContainer({ code: 1 });
  }
};

container();
