exports.BOOTSTRAP_MODE = {
  API: 'api',
};
exports.BOOTSTRAP_MODES = Object.values(this.BOOTSTRAP_MODE);

exports.ENV_MODE = Object.freeze({
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
});
exports.ENV_MODES = Object.values(this.ENV_MODE);

exports.OPEN_EDX_MYSQL_DEFAULT_SCHEMA = 'openedx';

exports.ERROR_LEVEL = Object.freeze({
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  FATAL: 'fatal',
});

exports.APP_ERROR_KIND = {
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  VALIDATION: 'validation',
  UNEXPECTED: 'unexpected',
}

exports.APP_ERROR_CODE = new Proxy(
  {
    API_MYSQL_CONN_START: true,
    API_MYSQL_TERMINATE: true,
    API_APPLICATION: true,
    API_APPLICATION_UNKNOWN: true,
    API_END_APPLICATION: true,
    API_END_APPLICATION_UNKNOWN: true,
    API_UNCAUGHT_EXCEPTION: true,
    OPEN_EDX_MYSQL_FETCH_USER_QUERY: true,
    APM_TERMINATE: true,
    DEFAULT: 'UNKNOWN_ERROR',
  },
  {
    get(target, key) {
      return key in target ? (typeof target[key] === 'string' ? target[key] : key) : target.DEFAULT;
    },
  },
);

exports.APP_ERROR_MESSAGE = new Proxy(
  Object.freeze({
    [this.APP_ERROR_CODE.API_MYSQL_CONN_START]:
      'Não foi possível inicar a conexão com o banco de dados MySQL do Open edX',
    [this.APP_ERROR_CODE.API_MYSQL_TERMINATE]:
      'Não foi possível finalizar a conexão com o banco de dados MySQL do Open edX',
    [this.APP_ERROR_CODE.API_APPLICATION]: 'Falha crítica no container da aplicação',
    [this.APP_ERROR_CODE.API_APPLICATION_UNKNOWN]: 'Falha crítica desconhecida no container da aplicação',
    [this.APP_ERROR_CODE.API_END_APPLICATION]: 'Erro ao encerrar a aplicação',
    [this.APP_ERROR_CODE.API_END_APPLICATION_UNKNOWN]: 'Erro desconhecido ao encerrar a aplicação',
    [this.APP_ERROR_CODE.API_UNCAUGHT_EXCEPTION]: 'Erro não tratado',
    [this.APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USER_QUERY]: 'Não foi possível obter o aluno do MySQL',
    [this.APP_ERROR_CODE.APM_TERMINATE]: 'Não foi possível fechar a conexão com o APM',
    DEFAULT: 'Erro desconhecido',
  }),
  {
    get(target, key) {
      return key in target ? target[key] : target.DEFAULT;
    },
  },
);
