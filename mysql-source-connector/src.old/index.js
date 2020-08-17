const MySQLEvents = require('@rodrigogs/mysql-events');

const { ENV_MODE, loadEnvironmentVariables } = require('./utils/config');

const { startLowDb } = require('./utils/lowDb');
// Triggers customizadas
const main = require('./triggers/main');
// Logger
const startLog = require('./utils/logger');
// COnexao com mysql
const { connectToMySQL } = require('./utils/MySql');
// Classe para manipulação do eventbridge
const CustomEventBridge = require('./utils/customEventBridge')({
  region: process.env.ENGAGED_AWS_EVENTBRIDGE_PRODUCER_REGION,
  accessKeyId: process.env.ENGAGED_AWS_EVENTBRIDGE_PRODUCER_ACCESS_KEY,
  secretAccessKey: process.env.ENGAGED_AWS_EVENTBRIDGE_PRODUCER_SECRET_KEY,
});
// handlers
const { queueHandlerFactory } = require('./queueHandler');
const { studentCourseEnrollmentFactory } = require('./handlers/student_courseenrollment');
const { coursewareStudentModuleFactory } = require('./handlers/courseware_studentmodule');

const program = async () => {
  const connection = await connectToMySQL();
  // Inicia o banco de dados local
  const db = startLowDb();
  if (!db) {
    Promise.reject('Erro ao iniciar o banco de dados local.');
  }
  // Configuração default da lib de eventos do banco de dados.
  let zongJiConfig = {
    startAtEnd: false,
    includeSchema: {
      openedx: ['student_courseenrollment', 'courseware_studentmodule'],
    },
  };
  // Resgata os valores de configuração no banco de dados local.
  const config = db.get('configuration').value();
  // Valida se ja foi inicializado os valores.
  if (!config || config.binlogName === undefined || config.nextPosition === undefined) {
    db.defaults({
      configuration: { nextPosition: 0, binlogName: '' },
      queue: [],
    }).write();
  } else {
    // Caso ja tenha sido, atualiza o objeto de configuração para que inicie na ultima parte do log.
    zongJiConfig = {
      ...zongJiConfig,
      binlogName: config.binlogName,
      binlogNextPos: config.nextPosition,
    };
  }
  // Configurações da instancia
  const instance = new MySQLEvents(connection, zongJiConfig);
  // Eventos do banco.
  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, (err) =>
    console.error(new Date(), 'MySQLEvents.EVENTS.CONNECTION_ERROR', err),
  );
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, (err) =>
    console.error(new Date(), 'MySQLEvents.EVENTS.ZONGJI_ERROR', err),
  );
  // Adiciona triggers customizadas.
  instance.addTrigger(main(db));
  // Inicializa a instancia.
  await instance.start();

  // Inicia loop de manipulação da lista de eventos.
  const { student_courseenrollment } = studentCourseEnrollmentFactory({
    connection,
    CustomEventBridge,
  });
  const { courseware_studentmodule } = coursewareStudentModuleFactory({
    connection,
    CustomEventBridge,
  });
  const { handler } = queueHandlerFactory({
    student_courseenrollment,
    courseware_studentmodule,
  });
  for (;;) {
    await handler(db);
  }
};

if (process.env.NODE_ENV === 'production') {
  const logger = startLog();
  console = logger;
}

program().catch((err) => {
  console.error(new Date(), 'Program error', err);
  process.exit(1);
});
