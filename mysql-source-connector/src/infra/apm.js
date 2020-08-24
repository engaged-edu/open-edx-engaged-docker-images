const apmAgent = require('elastic-apm-node');

exports.startAPM = ({ ENV }) => {
  apmAgent.start({
    serverUrl: ENV.APM_SERVER_URL,
    secretToken: ENV.APM_SECRET_TOKEN,
    serviceName: `${ENV.NODE_ENV}-mysql-source-connector-${ENV.BOOTSTRAP_MODE}-${ENV.ENGAGED_SERVER_IDENTIFIER}`,
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
        handleTerminationError({ error: flushError, code: '' });
      }
      return resolve();
    });
  });
  return;
};
