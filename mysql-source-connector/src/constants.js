exports.BOOTSTRAP_MODE = {
  WORKER: 'worker',
};
exports.BOOTSTRAP_MODES = Object.values(this.BOOTSTRAP_MODE);

exports.ENV_MODE = Object.freeze({
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
});
exports.ENV_MODES = Object.values(this.ENV_MODE);

exports.OPEN_EDX_MYSQL_DEFAULT_SCHEMA = 'openedx';

exports.OPEN_EDX_MYSQL_TABLE = Object.freeze({
  STUDENT_COURSE_ENROLLMENT: 'student_courseenrollment',
  COURSEWARE_STUDENT_MODULE: 'courseware_studentmodule',
});
exports.OPEN_EDX_MYSQL_TABLES = Object.values(this.OPEN_EDX_MYSQL_TABLE);

exports.EVENT_HANDLER_CONFIG = Object.freeze({
  [this.OPEN_EDX_MYSQL_TABLE.COURSEWARE_STUDENT_MODULE]: {
    eventAffectedRowUserField: 'student_id',
  },
  [this.OPEN_EDX_MYSQL_TABLE.STUDENT_COURSE_ENROLLMENT]: {
    eventAffectedRowUserField: 'user_id',
  },
});

exports.QUEUE_NAME = 'queue';
exports.DEAD_LETTER_QUEUE_NAME = 'dead-letter-queue';

exports.ERROR_LEVEL = Object.freeze({
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  FATAL: 'fatal',
});

exports.APP_ERROR_CODE = new Proxy(
  Object.freeze({
    QUEUE_GET_FROM_LOCAL_DB: true,
    QUEUE_SET_ON_LOCAL_DB: true,
    QUEUE_ADD_TO_DLQ: true,
    QUEUE_INIT_CONFIG: true,
    QUEUE_GET_CONFIG: true,
    QUEUE_UPDATE_CONFIG: true,
    QUEUE_HANDLING_EVENT: true,
    OPEN_EDX_MYSQL_FETCH_USERS_QUERY: true,
    EVENT_HANDLE: true,
    EVENT_EMIT_TO_EVENTBRIDGE: true,
    EVENT_HANDLE_MYSQL: true,
    TRIGGER_ADD: true,
    MYSQL_EVENTS_TERMINATION: true,
    DEFAULT: 'UNKNOWN_ERROR',
  }),
  {
    get(target, key) {
      return key in target ? (typeof target[key] === 'string' ? target[key] : key) : target.DEFAULT;
    },
  },
);

exports.APP_ERROR_MESSAGE = new Proxy(
  Object.freeze({
    [this.APP_ERROR_CODE.QUEUE_GET_FROM_LOCAL_DB]: 'Não foi possível obter a fila de eventos do banco de dados local',
    [this.APP_ERROR_CODE.QUEUE_SET_ON_LOCAL_DB]: 'Não foi possível salvar a fila de eventos no banco de dados local',
    [this.APP_ERROR_CODE.QUEUE_ADD_TO_DLQ]: 'Não foi possível enviar o evento para a dead-letter-queue',
    [this.APP_ERROR_CODE.QUEUE_INIT_CONFIG]: 'Não foi possível inicializar a configuração da fila',
    [this.APP_ERROR_CODE.QUEUE_GET_CONFIG]: 'Não foi possível recuperar a configuração da fila',
    [this.APP_ERROR_CODE.QUEUE_UPDATE_CONFIG]: 'Não foi possível atualizar a configuração da fila',
    [this.APP_ERROR_CODE.QUEUE_HANDLING_EVENT]: 'Não foi possível processar o evento da fila',
    [this.APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USERS_QUERY]: 'Não foi possível obter a lista de alunos do MySQL',
    [this.APP_ERROR_CODE.EVENT_HANDLE]: 'Não foi possível processar o evento da fila',
    [this.APP_ERROR_CODE.EVENT_EMIT_TO_EVENTBRIDGE]: 'Não foi possível enviar o evento para o AWS EventBridge',
    [this.APP_ERROR_CODE.EVENT_HANDLE_MYSQL]: 'Não foi possível processar o evento do MySql',
    [this.APP_ERROR_CODE.TRIGGER_ADD]: 'Não foi possível adicionar a trigger para eventos do MySQL',
    [this.APP_ERROR_CODE.MYSQL_EVENTS_TERMINATION]: 'Não foi possível encerrar o serviço de eventos do MySQL',
    DEFAULT: 'Erro desconhecido',
  }),
  {
    get(target, key) {
      return key in target ? target[key] : target.DEFAULT;
    },
  },
);
