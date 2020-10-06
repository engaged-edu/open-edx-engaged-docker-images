const { APP_ERROR_KIND_STATEGY, APP_ERROR_KIND, APP_ERROR_CODE } = require('../../../constants');

exports.responseDesignAPIMiddlewareFactory = ({ AppError }) => {
  return {
    responseDesignAPIMiddleware: (req, res, next) => {
      res.success = (result) => {
        return res.status(200).send({
          status: 'OK',
          result,
        });
      };
      res.catch = function responseCatchError(error) {
        if (error instanceof AppError) {
          error.flush();
          const { code, status } = APP_ERROR_KIND_STATEGY[error.kind];
          return res.status(code).send({
            status,
            error_message: error.message,
          });
        }
        if (error instanceof Error) {
          return responseCatchError(
            new AppError({
              error,
              kind: APP_ERROR_KIND.UNEXPECTED,
              code: APP_ERROR_CODE.API_UNCAUGHT_EXCEPTION,
            }),
          );
        }
        return responseCatchError(
          new AppError({
            error: new Error('unexpected error type caught by express'),
            kind: APP_ERROR_KIND.UNEXPECTED,
            code: APP_ERROR_CODE.API_UNCAUGHT_EXCEPTION,
          }),
        );
      };

      return next();
    },
  };
};
