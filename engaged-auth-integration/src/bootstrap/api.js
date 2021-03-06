const { startAPM, terminateAPM } = require('../infra/apm');

const { startLog } = require('../infra/logger');
const { configAppError } = require('../infra/error');
const { apiRouterFactory } = require('../infra/api/router');
const { loadEnvironmentVariables } = require('../infra/config');
const { startAPIServer, stopAPIServer } = require('../infra/api/api');
const { connectToMySQL, terminateMySQL } = require('../infra/db/mysql');
const { fetchUserFromOpenEdxFactory } = require('../domain/services/fetch-open-edx-user');
const { createAccessTokenAPIRouteFactory } = require('../infra/api/routes/create-access-token');
const { responseDesignAPIMiddlewareFactory } = require('../infra/api/middleware/response-design');
const { BOOTSTRAP_MODE, ERROR_LEVEL, APP_ERROR_MESSAGE, APP_ERROR_CODE } = require('../constants');
const { createOpenEdxUserAccessTokenFactory } = require('../domain/services/create-open-edx-user-access-token');
const { requestAuthenticationAPIMiddlewareFactory } = require('../infra/api/middleware/request-authentication');
const { createAccessTokenFromUserEmailFactory } = require('../domain/use-cases/create-access-token-from-user-email');

const container = async () => {
  let ContainerError, containerLogger, containerMySQL, containerServer, containerAPM;

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
      await stopAPIServer({ server: containerServer, handleTerminationError });
      await terminateAPM({ apm: containerAPM, handleTerminationError });
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

    const { apm } = startAPM({ ENV });
    containerAPM = apm;

    const { logger } = startLog({ ENV });
    containerLogger = logger;

    const { AppError } = configAppError({ logger, apm });
    ContainerError = AppError;

    const { mysql } = await connectToMySQL({ ENV, AppError });
    containerMySQL = mysql;

    const { fetchUserFromOpenEdx } = fetchUserFromOpenEdxFactory({ mysql, AppError });
    const { createOpenEdxUserAccessToken } = createOpenEdxUserAccessTokenFactory({ mysql, AppError });

    const { createAccessTokenFromUserEmail } = createAccessTokenFromUserEmailFactory({
      AppError,
      createOpenEdxUserAccessToken,
      fetchUserFromOpenEdx,
    });

    const { createAccessTokenAPIRoute } = createAccessTokenAPIRouteFactory({
      AppError,
      createAccessTokenFromUserEmail,
    });

    const { requestAuthenticationAPIMiddleware } = requestAuthenticationAPIMiddlewareFactory({ AppError, ENV });
    const { responseDesignAPIMiddleware } = responseDesignAPIMiddlewareFactory({ AppError });

    const { apiRouter } = apiRouterFactory({
      requestAuthenticationAPIMiddleware,
      responseDesignAPIMiddleware,
      createAccessTokenAPIRoute,
    });

    const { server } = await startAPIServer({ ENV, apiRouter });
    containerServer = server;
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
