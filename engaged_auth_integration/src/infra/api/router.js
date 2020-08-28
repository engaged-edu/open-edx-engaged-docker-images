
exports.apiRouterFactory = ({
  requestAuthenticationAPIMiddleware,
  responseDesignAPIMiddleware,
  createAccessTokenAPIRoute
} = {}) => {
  return {
    apiRouter: ({ app }) => {
      app.use(responseDesignAPIMiddleware);
      app.use(requestAuthenticationAPIMiddleware);
      app.post('/auth/access_token', requestAuthenticationAPIMiddleware);
      app.use((error, req, res, next) => {
        return res.catch(error);
      });
    }
  }
}
