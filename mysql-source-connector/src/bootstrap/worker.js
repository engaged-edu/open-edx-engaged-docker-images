const { BOOTSTRAP_MODE, ERROR_LEVEL } = require('../constants');
const { loadEnvironmentVariables } = require('../infra/config');
const { startLog } = require('../infra/logger');
const { configAppError } = require('../infra/error');
const { startLowDb } = require('../infra/db/lowdb');
const { connectToMySQL } = require('../infra/db/mysql');
const { startMySQLEvents } = require('../infra/db/mysql-events');

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
  let ContainerError, containerLogger, containerMySQL, containerMySQLEvents;

  const handleError = ({ error, message } = {}) => {
    if (ContainerError) {
      new ContainerError({
        level: ERROR_LEVEL.FATAL,
        error,
        message,
      }).flush();
    } else if (containerLogger) {
      containerLogger.fatal({
        error_message: message,
        error_origin_name: error.name,
        error_origin_message: error.message,
      });
    } else {
      console.log(
        JSON.stringify({
          level: ERROR_LEVEL.FATAL,
          error_message: message,
          error_origin_name: error.name,
          error_origin_message: error.message,
        }),
      );
    }
  };
  const terminateContainer = async ({ code = 2 } = {}) => {
    try {
      if (containerMySQLEvents) {
        // finaliza o listener de eventos
        await containerMySQLEvents.stop();
      }
      if (containerMySQL) {
        // finaliza a conexao com mysql
        await new Promise((resolve, reject) => {
          containerMySQL.end((connectionError) => {
            if (connectionError) {
              return reject(connectionError);
            }
            return resolve();
          });
        });
      }
    } catch (onCloseConnError) {
      if (onCloseConnError instanceof Error) {
        //TODO - Error message
        handleError({ error: onCloseConnError, message: 'Erro ao encerrar a aplicação' });
      } else {
        //TODO - Error message
        handleError({
          error: new Error('unknown error during container termination'),
          message: 'Erro desconhecido ao encerrar a aplicação ',
        });
      }
    }
    process.exit(code);
  };

  process.on('exit', () => {
    //TODO - Message
    console.log(JSON.stringify({ message: 'Application exiting' }));
  });
  ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => {
      terminateContainer({ code: 0 });
    });
  });
  process.on('uncaughtException', async function (uncaughtError) {
    //TODO - Error message
    handleError({ error: uncaughtError, message: 'Erro não tratado' });
    terminateContainer({ code: 1 });
  });

  try {
    const { ENV } = loadEnvironmentVariables({ bootstrapMode: BOOTSTRAP_MODE.WORKER });

    const { logger } = startLog({ ENV });
    containerLogger = logger;

    const { AppError } = configAppError({ logger });
    ContainerError = AppError;

    const { lowDb } = await startLowDb({ ENV }).catch((lowDbStartupError) => {
      //TODO - Error message
      throw new AppError({
        level: ERROR_LEVEL.FATAL,
        error: lowDbStartupError,
        message: 'Não foi possível inicar o banco de dados local da aplicação',
      });
    });

    const { mysql } = await connectToMySQL({ ENV }).catch((mysqlConnectionError) => {
      //TODO - Error message
      throw new AppError({
        level: ERROR_LEVEL.FATAL,
        error: mysqlConnectionError,
        message: 'Não foi possível inicar a conexão com o banco de dados MySQL do Open edX',
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
      //TODO - Error message
      handleError({
        message: 'Falha crítica no container da aplicação',
        error: containerBootstrapError,
      });
    } else {
      //TODO - Error message
      handleError({
        message: 'Falha crítica desconhecida no container da aplicação',
        error: new Error('unexpected container error'),
      });
    }
    terminateContainer({ code: 1 });
  }
}

container();
