const { startAPM, terminateAPM } = require('../infra/apm');
const { BOOTSTRAP_MODE, ERROR_LEVEL, APP_ERROR_MESSAGE, APP_ERROR_CODE } = require('../constants');
const { loadEnvironmentVariables } = require('../infra/config');
const { startLog } = require('../infra/logger');
const { configAppError } = require('../infra/error');
const { startLowDb } = require('../infra/db/lowdb');
const { connectToMySQL, terminateMySQL } = require('../infra/db/mysql');
const { startMySQLEvents, terminateMySQLEvents } = require('../infra/db/mysql-events');

const { configAWSSDK } = require('../infra/sdk/aws');
const { configAWSEventBridge } = require('../infra/sdk/event-bridge');

const { addEventToQueueFactory } = require('../domain/services/add-event-to-queue');
const { dequeueEventFactory } = require('../domain/services/dequeue-event');
const { emitEventToEventBridgeFactory } = require('../domain/services/emit-event-to-event-bridge');
const { fetchUsersFromOpenEdxFactory } = require('../domain/services/fetch-users-from-open-edx');
const { getQueueFactory } = require('../domain/services/get-queue');
const { getQueueConfigurationFactory } = require('../domain/services/get-queue-configuration');
const { getQueueHeadEventFactory } = require('../domain/services/get-queue-head-event');
const { handleMySQLEventFactory } = require('../domain/services/handle-mysql-event');
const { handleQueueEventFactory } = require('../domain/services/handle-queue-event');
const { initQueueConfigurationFactory } = require('../domain/services/init-queue-configuration');
const { removeQueueHeadEventFactory } = require('../domain/services/remove-queue-head-event');
const { setQueueFactory } = require('../domain/services/set-queue');
const { updateQueueConfigurationFactory } = require('../domain/services/update-queue-configuration');

const setImmediatePromise = () => {
  return new Promise((resolve) => {
    setImmediate(() => resolve());
  });
};

async function container() {
  let ContainerError, containerLogger, containerMySQL, containerMySQLEvents, containerAPM;

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
      await terminateMySQLEvents({ mysqlEventInstance: containerMySQLEvents, handleTerminationError });
      await terminateMySQL({ mysql: containerMySQL, handleTerminationError });
      await terminateAPM({ apm: containerAPM, handleTerminationError });
    } catch (onCloseConnError) {
      if (onCloseConnError instanceof Error) {
        handleTerminationError({
          error: onCloseConnError,
          code: APP_ERROR_CODE.WORKER_END_APPLICATION,
        });
      } else {
        handleTerminationError({
          error: new Error('unknown error during container termination'),
          code: APP_ERROR_CODE.WORKER_END_APPLICATION_UNKNOWN,
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
    handleTerminationError({ error: uncaughtError, code: APP_ERROR_CODE.WORKER_UNCAUGHT_EXCEPTION });
    terminateContainer({ code: 1 });
  });

  try {
    const { ENV } = loadEnvironmentVariables({ bootstrapMode: BOOTSTRAP_MODE.WORKER });

    const { apm } = startAPM({ ENV });
    containerAPM = apm;

    const { logger } = startLog({ ENV });
    containerLogger = logger;

    const { AppError } = configAppError({ logger });
    ContainerError = AppError;

    const { lowDb } = await startLowDb({ ENV }).catch((lowDbStartupError) => {
      throw new AppError({
        level: ERROR_LEVEL.FATAL,
        error: lowDbStartupError,
        code: APP_ERROR_CODE.WORKER_LOCAL_DB_START,
      });
    });

    const { mysql } = await connectToMySQL({ ENV }).catch((mysqlConnectionError) => {
      throw new AppError({
        level: ERROR_LEVEL.FATAL,
        error: mysqlConnectionError,
        code: APP_ERROR_CODE.WORKER_MYSQL_CONN_START,
      });
    });
    containerMySQL = mysql;

    const { aws } = configAWSSDK({ ENV });
    const { eventBridge } = configAWSEventBridge({ aws, ENV });

    const { getQueue } = getQueueFactory({ lowDb, AppError });
    const { setQueue } = setQueueFactory({ lowDb, AppError });
    const { addEventToQueue } = addEventToQueueFactory({ getQueue, setQueue });
    const { getQueueHeadEvent } = getQueueHeadEventFactory({ getQueue });
    const { removeQueueHeadEvent } = removeQueueHeadEventFactory({ getQueue, setQueue });
    const { fetchUsersFromOpenEdx } = fetchUsersFromOpenEdxFactory({ mysql, AppError });
    const { emitEventToEventBridge } = emitEventToEventBridgeFactory({ ENV, eventBridge, AppError });
    const { handleQueueEvent } = handleQueueEventFactory({
      emitEventToEventBridge,
      fetchUsersFromOpenEdx,
      AppError,
    });
    const { dequeueEvent } = dequeueEventFactory({
      addEventToQueue,
      getQueueHeadEvent,
      removeQueueHeadEvent,
      handleQueueEvent,
      AppError,
      apm,
    });
    const { getQueueConfiguration } = getQueueConfigurationFactory({ lowDb, AppError });
    const { initQueueConfiguration } = initQueueConfigurationFactory({ lowDb, AppError });
    const { updateQueueConfiguration } = updateQueueConfigurationFactory({ lowDb, AppError });
    const { handleMySQLEvent } = handleMySQLEventFactory({
      addEventToQueue,
      updateQueueConfiguration,
      AppError,
    });
    const { mysqlEventInstance } = await startMySQLEvents({
      apm,
      ENV,
      mysql,
      AppError,
      handleMySQLEvent,
      getQueueConfiguration,
      initQueueConfiguration,
    });
    containerMySQLEvents = mysqlEventInstance;

    for (;;) {
      await setImmediatePromise();
      await dequeueEvent();
    }
  } catch (containerBootstrapError) {
    if (containerBootstrapError instanceof Error) {
      handleTerminationError({
        code: APP_ERROR_CODE.WORKER_APPLICATION,
        error: containerBootstrapError,
      });
    } else {
      handleTerminationError({
        code: APP_ERROR_CODE.WORKER_APPLICATION_UNKNOWN,
        error: new Error('unexpected container error'),
      });
    }
    terminateContainer({ code: 1 });
  }
}

container();
