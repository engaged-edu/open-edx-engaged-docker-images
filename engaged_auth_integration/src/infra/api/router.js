exports.apiRouterFactory = ({
  requestAuthenticationAPIMiddleware,
  responseDesignAPIMiddleware,
  createAccessTokenAPIRoute,
} = {}) => {
  return {
    apiRouter: ({ app }) => {
      app.use(responseDesignAPIMiddleware);
      app.use(requestAuthenticationAPIMiddleware);
      app.post('/auth/access_token', createAccessTokenAPIRoute);
      // eslint-disable-next-line no-unused-vars
      app.use((error, req, res, next) => {
        return res.catch(error);
      });
    },
  };
};
