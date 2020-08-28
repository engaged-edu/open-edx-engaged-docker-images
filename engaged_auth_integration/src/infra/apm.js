const apmAgent = require('elastic-apm-node');
const { APP_ERROR_CODE } = require('../constants');

exports.startAPM = ({ ENV }) => {
  apmAgent.start({
    serverUrl: ENV.APM_SERVER_URL,
    // secretToken: ENV.APM_SECRET_TOKEN,
    serviceName: `${ENV.NODE_ENV}-engaged-auth-integration-${ENV.BOOTSTRAP_MODE}-${ENV.ENGAGED_SERVER_IDENTIFIER}`,
    serviceVersion: ENV.APP_VERSION,
    environment: ENV.NODE_ENV,
  });
  return { apm: apmAgent };
};

exports.terminateAPM = async ({ apm, handleTerminationError } = {}) => {
  if (!(apm instanceof apmAgent.constructor)) {
    return;
  }
  await new Promise((resolve) => {
    apm.flush((flushError) => {
      if (flushError) {
        handleTerminationError({ error: flushError, code: APP_ERROR_CODE.APM_TERMINATE });
      }
      return resolve();
    });
  });
  return;
};
