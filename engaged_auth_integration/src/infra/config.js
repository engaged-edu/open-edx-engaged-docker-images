const env = require('dotenv');
const joi = require('@hapi/joi');
const { ENV_MODE, ENV_MODES, BOOTSTRAP_MODES, OPEN_EDX_MYSQL_DEFAULT_SCHEMA } = require('../constants');
const { version } = require('../../package.json');
/**
 * @typedef {Object} ENV
 * @property {string} NODE_ENV
 * @property {string} OPEN_EDX_MYSQL_HOST
 * @property {string} OPEN_EDX_MYSQL_DATABASE
 * @property {string} OPEN_EDX_MYSQL_USERNAME
 * @property {string} OPEN_EDX_MYSQL_PASSWORD
 * @property {string} ENGAGED_SERVER_IDENTIFIER
 * @property {string} APM_SERVER_URL
 * @property {string} APM_SECRET_TOKEN
 */

/**
 *
 * @param {*} param0
 * @returns {{ ENV: ENV }}
 */
const loadEnvironmentVariables = ({ bootstrapMode } = {}) => {
  if (!BOOTSTRAP_MODES.includes(bootstrapMode)) {
    throw new Error('Bootstrap mode is required');
  }

  const { parsed: rawEnvVars, error: envVarsLoadError } = env.config();
  if (envVarsLoadError) {
    throw envVarsLoadError;
  }

  const { value: envVars, error: envVarsValidationError } = joi
    .object()
    .keys({
      NODE_ENV: joi
        .string()
        .default(ENV_MODE.DEVELOPMENT)
        .valid(...ENV_MODES),
      API_SERVER_PORT: joi.number().port().required(),
      API_SECRET_KEY: joi.string().required(),
      OPEN_EDX_MYSQL_HOST: joi.string().required(),
      OPEN_EDX_MYSQL_DATABASE: joi.string().default(OPEN_EDX_MYSQL_DEFAULT_SCHEMA),
      OPEN_EDX_MYSQL_USERNAME: joi.string().required(),
      OPEN_EDX_MYSQL_PASSWORD: joi.string().required(),
      ENGAGED_SERVER_IDENTIFIER: joi.string().required(),
      APM_SERVER_URL: joi.string().required(),
      APM_SECRET_TOKEN: joi.string().required(),
    })
    .required()
    .validate(rawEnvVars);
  if (envVarsValidationError) {
    throw envVarsValidationError;
  }

  envVars.APP_VERSION = version;
  envVars.BOOTSTRAP_MODE = bootstrapMode;

  return { ENV: envVars };
};

module.exports = {
  ENV_MODE,
  loadEnvironmentVariables,
};
