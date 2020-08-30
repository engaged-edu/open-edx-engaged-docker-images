const { APP_ERROR_KIND_STATEGY } = require('../../../constants');

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
          const { code, status } = APP_ERROR_KIND_STATEGY[error.kind];
          return res.status(code).send({
            status,
            error_message: error.message,
          });
        }
        if (error instanceof Error) {
          return responseCatchError(new AppError(error));
        }
        return responseCatchError(new AppError(new Error('')));
      };

      return next();
    },
  };
};
