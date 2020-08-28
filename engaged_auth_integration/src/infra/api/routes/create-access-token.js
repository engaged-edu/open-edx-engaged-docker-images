const joi = require('@hapi/joi');
const { ensureParams } = require('../helpers/ensure-params');
const { APP_ERROR_KIND } = require('../../../constants');

exports.createAccessTokenAPIRouteFactory = ({ AppError, createAccessTokenFromUserEmail } = {}) => {
  return {
    createAccessTokenAPIRoute: async (req, res) => {
      const { email } = ensureParams(
        {
          schema: {
            email: joi.string().email().required(),
          },
          params: {
            email: req.body.email,
          },
        },
        (error) => {
          throw new AppError({ error, kind: APP_ERROR_KIND.VALIDATION });
        },
      );

      const { user, accessToken } = await createAccessTokenFromUserEmail({ email });

      return res.success({
        user,
        access_token: accessToken,
      });
    },
  };
};
