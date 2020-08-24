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

exports.APP_ERROR_MESSAGE = Object.freeze({
  QUEUE: {
    GET_FROM_LOCAL_DB: 'Não foi possível obter a fila de eventos do banco de dados local',
    SET_ON_LOCAL_DB: 'Não foi possível salvar a fila de eventos no banco de dados local',
    ADD_TO_DLQ: 'Não foi possível enviar o evento para a dead-letter-queue',
    INIT_CONFIG: 'Não foi possível inicializar a configuração da fila',
    GET_CONFIG: 'Não foi possível recuperar a configuração da fila',
    UPDATE_CONFIG: 'Não foi possível atualizar a configuração da fila',
    HANDLING_EVENT: 'Não foi possível processar o evento da fila',
  },
  OPEN_EDX_MYSQL: {
    FETCH_USERS_QUERY: 'Não foi possível obter a lista de alunos do MySQL',
  },
  EVENT: {
    HANDLE: 'Não foi possível processar o evento da fila',
    EMIT_TO_EVENTBRIDGE: 'Não foi possível enviar o evento para o AWS EventBridge',
    HANDLE_MYSQL: 'Não foi possível processar o evento do MySql',
  },
  TRIGGER: {
    ADD: 'Não foi possível adicionar a trigger para eventos do MySQL',
  },
});
