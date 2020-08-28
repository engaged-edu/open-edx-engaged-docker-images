const { APP_ERROR_CODE, APP_ERROR_KIND } = require('../../../constants');

exports.requestAuthenticationAPIMiddlewareFactory = ({ ENV, AppError }) => {
  return {
    requestAuthenticationAPIMiddleware: (req, res, next) => {
      if (req.headers['authorization'] !== ENV.API_SECRET_KEY) {
        return res.catch(
          new AppError({
            error: new Error('Missing secret key'),
            code: APP_ERROR_CODE.NO_SECRET_KEY,
            kind: APP_ERROR_KIND.FORBIDDEN,
          }),
        );
      }
      return next();
    },
  };
};
