const MySQLEvents = require('@rodrigogs/mysql-events');
const { OPEN_EDX_MYSQL_TABLES, APP_ERROR_CODE } = require('../../constants');

exports.startMySQLEvents = async ({
  apm,
  ENV,
  mysql,
  getQueueConfiguration,
  initQueueConfiguration,
  handleMySQLEvent,
  AppError,
}) => {
  // Configuração default da lib de eventos do banco de dados.
  let zongJiConfig = {
    startAtEnd: false,
    includeSchema: {
      [ENV.OPEN_EDX_MYSQL_DATABASE]: OPEN_EDX_MYSQL_TABLES,
    },
  };

  let config = getQueueConfiguration();
  if (!config || config.binlogName === undefined || config.nextPosition === undefined) {
    initQueueConfiguration();
  } else {
    // Caso ja tenha sido, atualiza o objeto de configuração para que inicie na ultima parte do log.
    zongJiConfig = {
      ...zongJiConfig,
      binlogName: config.binlogName,
      binlogNextPos: config.nextPosition,
    };
  }

  const instance = new MySQLEvents(mysql, zongJiConfig);
  // Eventos do banco.
  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, (err) =>
    console.error(new Date(), 'MySQLEvents.EVENTS.CONNECTION_ERROR', err),
  );
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, (err) =>
    console.error(new Date(), 'MySQLEvents.EVENTS.ZONGJI_ERROR', err),
  );

  instance.addTrigger({
    name: ENV.OPEN_EDX_MYSQL_DATABASE,
    expression: '*',
    statement: MySQLEvents.STATEMENTS.ALL,
    onEvent: (event) => {
      apm.startTransaction('mysql-binlog-event-trigger', 'db', 'mysql');
      try {
        handleMySQLEvent({ event });
        apm.endTransaction(200);
      } catch (handleError) {
        new AppError({
          code: APP_ERROR_CODE.TRIGGER_ADD,
          error: handleError,
          context: {
            mysql_trigger_event: event,
          },
        }).flush();
        apm.endTransaction(500);
      }
    },
  });

  await instance.start();

  return { mysqlEventInstance: instance };
};

exports.terminateMySQLEvents = async ({ mysqlEventInstance, handleTerminationError } = {}) => {
  if (!(mysqlEventInstance instanceof MySQLEvents)) {
    return;
  }
  await mysqlEventInstance.stop().catch((stopError) => {
    handleTerminationError({ error: stopError, code: APP_ERROR_CODE.MYSQL_EVENTS_TERMINATION });
    return;
  });
  return;
};
