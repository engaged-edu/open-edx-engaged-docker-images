
exports.requestAuthenticationAPIMiddlewareFactory = ({ ENV, AppError }) => {
  return {
    requestAuthenticationAPIMiddleware: (req, res, next) => {
      if(req.headers['Authorization'] !== ENV.API_SECRET_KEY) {
        return res.catch(new AppError(new Error()));
      }
      return next();
    }
  }
}
