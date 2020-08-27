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

exports.APP_ERROR_CODE = new Proxy(
  {
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
    DEFAULT: 'Erro desconhecido',
  }),
  {
    get(target, key) {
      return key in target ? target[key] : target.DEFAULT;
    },
  },
);
