const path = require('path');
const env = require('dotenv');
const joi = require('@hapi/joi');
const { ENV_MODE, ENV_MODES, BOOTSTRAP_MODES, OPEN_EDX_MYSQL_DEFAULT_SCHEMA } = require('../constants');
const { version } = require('../../package.json');

const PROCESS_ROOT_DIR = process.cwd();
const SERVER_ROOT_DIR = path.parse(PROCESS_ROOT_DIR).root;

const DATA_DIR = {
  [ENV_MODE.PRODUCTION]: path.join(SERVER_ROOT_DIR, 'var', 'lib', 'app-data'),
  [ENV_MODE.DEVELOPMENT]: path.join(PROCESS_ROOT_DIR, 'data'),
};

const getLowDBFilePath = (envMode) => path.join(DATA_DIR[envMode], 'lowdb', 'db.json');

/**
 * @typedef {Object} ENV
 * @property {string} NODE_ENV
 * @property {string} OPEN_EDX_MYSQL_HOST
 * @property {string} OPEN_EDX_MYSQL_DATABASE
 * @property {string} OPEN_EDX_MYSQL_USERNAME
 * @property {string} OPEN_EDX_MYSQL_PASSWORD
 * @property {string} ENGAGED_AWS_ACCESS_KEY
 * @property {string} ENGAGED_AWS_SECRET_KEY
 * @property {string} ENGAGED_AWS_EVENTBRIDGE_PRODUCER_NAME
 * @property {string} ENGAGED_AWS_EVENTBRIDGE_BUS_NAME
 * @property {string} ENGAGED_AWS_EVENTBRIDGE_BUS_REGION
 * @property {string} ENGAGED_SERVER_IDENTIFIER
 * @property {string} APM_SERVER_URL
 * @property {string} APM_SECRET_TOKEN
 * @property {string} BOOTSTRAP_MODE
 * @property {string} LOWDB_FILE_PATH
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
      OPEN_EDX_MYSQL_HOST: joi.string().required(),
      OPEN_EDX_MYSQL_DATABASE: joi.string().default(OPEN_EDX_MYSQL_DEFAULT_SCHEMA),
      OPEN_EDX_MYSQL_USERNAME: joi.string().required(),
      OPEN_EDX_MYSQL_PASSWORD: joi.string().required(),
      ENGAGED_AWS_ACCESS_KEY: joi.string().required(),
      ENGAGED_AWS_SECRET_KEY: joi.string().required(),
      ENGAGED_AWS_EVENTBRIDGE_PRODUCER_NAME: joi.string().default('open-edx-mysql-source-connector'),
      ENGAGED_AWS_EVENTBRIDGE_BUS_NAME: joi.string().default('open-edx-event-bus'),
      ENGAGED_AWS_EVENTBRIDGE_BUS_REGION: joi.string().default('sa-east-1'),
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
  envVars.LOWDB_FILE_PATH = getLowDBFilePath(envVars.NODE_ENV);

  return { ENV: envVars };
};

module.exports = {
  ENV_MODE,
  loadEnvironmentVariables,
};
