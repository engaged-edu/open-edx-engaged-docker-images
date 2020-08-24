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
  async function close() {
    try {
      if (containerMySQLEvents) {
        // finaliza o listener de eventos
        await containerMySQLEvents.stop();
      }
      if (containerMySQL) {
        // finaliza a conexao com mysql
        containerMySQL.end();
      }
    } catch (onCloseConnError) {
      console.log(
        JSON.stringify({
          level: ERROR_LEVEL.FATAL,
          error_message: onCloseConnError.message || 'onCloseConnError',
          error_origin_name: 'Unknown',
          error_origin_message: 'Unknown',
        }),
      );
    }
  }

  process.on('exit', close);
  process.on('SIGINT', close);
  process.on('uncaughtException', function (uncaughtError) {
    console.log(
      JSON.stringify({
        level: ERROR_LEVEL.FATAL,
        error_message: uncaughtError.message,
        error_origin_name: uncaughtError.name,
        error_origin_message: 'uncaughtError',
      }),
    );
    // trata o erro com o método disponível
    close();
  });

  try {
    const { ENV } = loadEnvironmentVariables({ bootstrapMode: BOOTSTRAP_MODE.WORKER });

    const { logger } = startLog({ ENV });
    containerLogger = logger;

    const { AppError } = configAppError({ logger });
    ContainerError = AppError;

    const { lowDb } = await startLowDb({ ENV }).catch((lowDbStartupError) => {
      throw new AppError({
        level: ERROR_LEVEL.FATAL,
        error: lowDbStartupError,
        message: 'Não foi possível inicar o banco de dados local da aplicação',
      });
    });

    const { mysql } = await connectToMySQL({ ENV }).catch((mysqlConnectionError) => {
      throw new AppError({
        level: ERROR_LEVEL.FATAL,
        error: mysqlConnectionError,
        message: 'Não foi possível inicar a conexão com o banco de dados MySQL do Open edX',
      });
    });

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

    for (;;) {
      await setImmediatePromise();
      await dequeueEvent();
    }
  } catch (containerBootstrapError) {
    let finalErrorMessage = 'Falha crítica no container da aplicação';
    if (containerBootstrapError instanceof Error) {
      if (ContainerError) {
        new ContainerError({
          level: ERROR_LEVEL.FATAL,
          error: containerBootstrapError,
          message: finalErrorMessage,
        }).flush();
      } else if (containerLogger) {
        containerLogger.fatal({
          error_message: finalErrorMessage,
          error_origin_name: containerBootstrapError.name,
          error_origin_message: containerBootstrapError.message,
        });
      } else {
        console.log(
          JSON.stringify({
            level: ERROR_LEVEL.FATAL,
            error_message: finalErrorMessage,
            error_origin_name: containerBootstrapError.name,
            error_origin_message: containerBootstrapError.message,
          }),
        );
      }
    } else {
      finalErrorMessage += ' (Desconhecida)';
      if (ContainerError) {
        new ContainerError({
          level: ERROR_LEVEL.FATAL,
          error: new Error('Unknown'),
          message: finalErrorMessage,
        }).flush();
      } else if (containerLogger) {
        containerLogger.fatal({
          error_message: finalErrorMessage,
          error_origin_name: 'Unknown',
          error_origin_message: 'Unknown',
        });
      } else {
        console.log(
          JSON.stringify({
            level: ERROR_LEVEL.FATAL,
            error_message: finalErrorMessage,
            error_origin_name: 'Unknown',
            error_origin_message: 'Unknown',
          }),
        );
      }
    }
    close();
    process.exit(1);
  }
}

container();
