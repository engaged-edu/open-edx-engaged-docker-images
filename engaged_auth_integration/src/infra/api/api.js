const Express = require('express');

exports.startAPIServer = ({ ENV, apiRouter } = {}) => {
  return new Promise((resolve, reject) => {
    const api = Express();
    api.use(Express.json({ limit: '1mb' }));
    apiRouter({ api });
    api.listen(ENV.API_SERVER_PORT, (serverError) => {
      if(serverError) {
        return reject(serverError);
      }
      return resolve({ api });
    });
  });
}
exports.stopAPIServer = ({ api }) => {

}
