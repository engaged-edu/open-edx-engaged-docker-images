const joi = require('@hapi/joi');
const dotenv = require('dotenv');

const ENV_MODE = {
    PRODUCTION: 'production',
    DEVELOPMENT: 'development'
}
const ENV_MODES = Object.values(ENV_MODE);

const loadEnvironmentVariables = () => {
    const {
        parsed: rawEnvVars,
        error: envVarsLoadError,
    } = dotenv.config();
    if(envVarsLoadError) {
        throw envVarsLoadError;
    }

    const {
        value: envVars,
        error: envVarsValidationError
    } = joi.object().keys({
        NODE_ENV: joi.string().default(ENV_MODE.DEVELOPMENT).valid(...ENV_MODES),
        DATABASE_HOST: joi.string().required(),
        DATABASE_SCHEMA: joi.string().default('openedx'),
        DATABASE_USERNAME: joi.string().required(),
        DATABASE_PASSWORD: joi.string().required(),
        ENGAGED_AWS_EVENTBRIDGE_PRODUCER_NAME: joi.string().default('open-edx-mysql-source-connector'),
        ENGAGED_AWS_EVENTBRIDGE_PRODUCER_ACCESS_KEY: joi.string().required(),
        ENGAGED_AWS_EVENTBRIDGE_PRODUCER_SECRET_KEY: joi.string().required(),
        ENGAGED_AWS_EVENTBRIDGE_BUS_NAME: joi.string().default('open-edx-event-bus'),
        ENGAGED_AWS_EVENTBRIDGE_BUS_REGION: joi.string().default('sa-east-1'),
        ENGAGED_SERVER_IDENTIFIER: joi.string().required(),
    }).required().validate(rawEnvVars);
    if(envVarsValidationError) {
        throw envVarsValidationError;
    }
    envVars.PATH
    return envVars;
}

module.exports = {
    ENV_MODE,
    loadEnvironmentVariables
}
