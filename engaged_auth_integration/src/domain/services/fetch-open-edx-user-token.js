const joi = require('@hapi/joi');
const { APP_ERROR_CODE } = require('../../constants');

/**
 * @param {{mysql: import('mysql').Connection}} params
 */
exports.fetchUserTokenFromOpenEdxFactory = ({ mysql, AppError } = {}) => {
  return {
    fetchUserTokenFromOpenEdx: (params = {}) => {
      return new Promise((resolve, reject) => {
        try {
          /**
           * @type {{ token_id: '' }}
           */
          const { token_id } = joi.attempt(
            params,
            joi
              .object({
                token_id: joi.number().required(),
              })
              .required(),
          );
          mysql.query(
            `select * FROM openedx.oauth2_provider_accesstoken where id = ${token_id};`,
            (usersQueryError, result) => {
              if (usersQueryError) {
                return reject(
                  new AppError({
                    code: APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USER_TOKEN_QUERY,
                    error: usersQueryError,
                  }),
                );
              }
              if (!Array.isArray(result)) {
                return reject(
                  new AppError({
                    code: APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USER_TOKEN_QUERY,
                    error: new Error('invalid mysql query response'),
                  }),
                );
              }
              if (result.length > 0) {
                return resolve({ accessToken: { ...result[0] } });
              }
              return resolve({ accessToken: undefined });
            },
          );
        } catch (mysqlError) {
          return reject(
            new AppError({
              code: APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USER_TOKEN_QUERY,
              error: mysqlError,
            }),
          );
        }
      });
    },
  };
};
