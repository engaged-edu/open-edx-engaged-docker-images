const { APP_ERROR_CODE, APP_ERROR_KIND } = require('../../constants');

exports.createAccessTokenFromUserEmailFactory = ({
  AppError,
  createOpenEdxUserAccessToken,
  fetchUserFromOpenEdx,
  fetchUserTokenFromOpenEdx,
}) => {
  return {
    createAccessTokenFromUserEmail: async ({ email } = {}) => {
      try {
        const { user } = await fetchUserFromOpenEdx({ email });
        if (!user) {
          throw new AppError({
            code: APP_ERROR_CODE.EDX_USER_NOT_FOUND,
            error: new Error('User was not found'),
            kind: APP_ERROR_KIND.NOT_FOUND,
          });
        }
        const { accessTokenResult } = await createOpenEdxUserAccessToken({ user_id: user.id });
        const { token_id } = accessTokenResult;
        const { accessToken } = await fetchUserTokenFromOpenEdx({ token_id });
        return { user, accessToken };
      } catch (createAccessTokenFromUserEmailError) {
        throw new AppError({
          code: APP_ERROR_CODE.CREATE_TOKEN_FROM_USER_EMAIL,
          error: createAccessTokenFromUserEmailError,
        });
      }
    },
  };
};
