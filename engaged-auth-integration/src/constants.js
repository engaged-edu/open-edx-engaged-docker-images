/**
 * @template T
 * @param {T} obj
 * @returns {T}
 */
const wrapProxy = (obj) =>
  new Proxy(obj, {
    get(target, key) {
      return key in target ? (typeof target[key] === 'string' ? target[key] : key) : target.DEFAULT;
    },
  });

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

exports.APP_ERROR_KIND = wrapProxy({
  FATAL: true,
  FORBIDDEN: true,
  NOT_FOUND: true,
  VALIDATION: true,
  UNEXPECTED: true,
  DEFAULT: 'INTERNAL',
});

exports.APP_ERROR_KIND_STATEGY = Object.freeze({
  [this.APP_ERROR_KIND.FORBIDDEN]: { code: 403, status: this.APP_ERROR_KIND.FORBIDDEN },
  [this.APP_ERROR_KIND.NOT_FOUND]: { code: 404, status: this.APP_ERROR_KIND.NOT_FOUND },
  [this.APP_ERROR_KIND.VALIDATION]: { code: 400, status: this.APP_ERROR_KIND.VALIDATION },
  [this.APP_ERROR_KIND.UNEXPECTED]: { code: 500, status: this.APP_ERROR_KIND.UNEXPECTED },
  [this.APP_ERROR_KIND.FATAL]: { code: 502, status: this.APP_ERROR_KIND.UNEXPECTED },
  DEFAULT: { code: 500, status: this.APP_ERROR_KIND.DEFAULT },
});

exports.APP_ERROR_CODE = wrapProxy({
  API_START: true,
  API_MYSQL_CONN_START: true,
  API_MYSQL_TERMINATE: true,
  API_APPLICATION: true,
  API_APPLICATION_UNKNOWN: true,
  API_END_APPLICATION: true,
  API_END_APPLICATION_UNKNOWN: true,
  API_UNCAUGHT_EXCEPTION: true,
  API_PARAMS_VALIDATION: true,
  OPEN_EDX_MYSQL_FETCH_USER_QUERY: true,
  OPEN_EDX_MYSQL_FETCH_USER_TOKEN_QUERY: true,
  APM_TERMINATE: true,
  API_TERMINATE: true,
  EDX_USER_NOT_FOUND: true,
  CREATE_TOKEN_FROM_USER_EMAIL: true,
  INSERT_OPEN_EDX_AUTH_TOKEN: true,
  NO_SECRET_KEY: true,
  DEFAULT: 'UNKNOWN_ERROR',
});

exports.APP_ERROR_MESSAGE = wrapProxy({
  [this.API_PARAMS_VALIDATION]: 'Parâmetros informados inválidos',
  [this.APP_ERROR_CODE.API_START]: 'Falha ao iniciar o servidor de API',
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
  [this.APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USER_TOKEN_QUERY]: 'Não foi possível obter o token do aluno do MySQL',
  [this.APP_ERROR_CODE.APM_TERMINATE]: 'Não foi possível fechar a conexão com o APM',
  [this.APP_ERROR_CODE.API_TERMINATE]: 'Não foi possível fechar a conexão com o servidor de API',
  [this.APP_ERROR_CODE.EDX_USER_NOT_FOUND]: 'Usuário não encontrado',
  [this.APP_ERROR_CODE.CREATE_TOKEN_FROM_USER_EMAIL]: 'Não foi possível gerar o token a partir do email do usuário',
  [this.APP_ERROR_CODE.INSERT_OPEN_EDX_AUTH_TOKEN]: 'Não foi possível inserir o token de autenticação para o usuário',
  [this.APP_ERROR_CODE.NO_SECRET_KEY]: 'Requisição não possui a chave secreta',
  DEFAULT: 'Erro desconhecido',
});
