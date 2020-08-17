const MySQLEvents = require('@rodrigogs/mysql-events');
const { OPEN_EDX_MYSQL_TABLES } = require('../../constants');

exports.startMySQLEvents = async ({ ENV, mysql, getQueueConfiguration, initQueueConfiguration, handleMySQLEvent }) => {
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

  instance.addTrigger(handleMySQLEvent);

  await instance.start();

  return { mysqlEventInstance: instance };
};
