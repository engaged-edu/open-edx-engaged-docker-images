const Express = require('express');
const { APP_ERROR_CODE, APP_ERROR_KIND } = require('../../constants');

exports.startAPIServer = ({ ENV, apiRouter, AppError } = {}) => {
  return new Promise((resolve, reject) => {
    const api = Express();
    api.use(Express.json({ limit: '1mb' }));
    apiRouter({ api });
    const server = api.listen(ENV.API_SERVER_PORT, (serverError) => {
      if (serverError) {
        return reject(
          new AppError({ error: serverError, kind: APP_ERROR_KIND.DEFAULT, CODE: APP_ERROR_CODE.API_START }),
        );
      }
      return resolve({ api, server });
    });
  });
};

exports.stopAPIServer = async ({ server, handleTerminationError } = {}) => {
  if (!server) {
    return;
  }
  await new Promise((resolve) => {
    server.close((serverCloseError) => {
      if (serverCloseError) {
        handleTerminationError({ error: serverCloseError, code: APP_ERROR_CODE.API_TERMINATE });
      }
      return resolve();
    });
  });
};
