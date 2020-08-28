const { APP_ERROR_KIND } = require('../../../constants');

exports.responseDesignAPIMiddlewareFactory = ({ AppError }) => {
  return {
    responseDesignAPIMiddleware: (req, res, next) => {

      res.success = (result) => {
        return res.status(200).send({
          status: 'OK',
          result
        });
      }
      res.catch = function responseCatchError(error) {
        if(error instanceof AppError) {
          switch(error.kind) {
            case APP_ERROR_KIND.NOT_FOUND:
              return res.status(404).send({
                status: 'NOT-FOUND',
                error_message: error.message
              });
            case APP_ERROR_KIND.VALIDATION:
              return res.status(400).send({
                status: 'BAD-REQUEST',
                error_message: error.message
              });
            case APP_ERROR_KIND.FORBIDDEN:
              return res.status(400).send({
                status: 'FORBIDDEN',
                error_message: error.message
              });
            case APP_ERROR_KIND.UNEXPECTED:
            default:
              return res.status(500).send({
                status: 'INTERNAL-ERROR',
                error_message: error.message
              });
          }
        }
        if(error instanceof Error) {
          return responseCatchError(new AppError(error));
        }
        return responseCatchError(new AppError(new Error('')));
      }

      return next();
    }
  }
}
