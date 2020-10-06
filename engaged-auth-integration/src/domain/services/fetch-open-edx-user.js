const joi = require('@hapi/joi');
const { APP_ERROR_CODE } = require('../../constants');

/**
 * @param {{mysql: import('mysql').Connection}} params
 */
exports.fetchUserFromOpenEdxFactory = ({ mysql, AppError } = {}) => {
  return {
    fetchUserFromOpenEdx: (params = {}) => {
      return new Promise((resolve, reject) => {
        try {
          /**
           * @type {{ email: '' }}
           */
          const { email } = joi.attempt(
            params,
            joi
              .object({
                email: joi.string().email().required(),
              })
              .required(),
          );
          mysql.query(`select * from auth_user where email like '${email}'`, (usersQueryError, result) => {
            if (usersQueryError) {
              return reject(
                new AppError({
                  code: APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USER_QUERY,
                  error: usersQueryError,
                }),
              );
            }
            if (!Array.isArray(result)) {
              return reject(
                new AppError({
                  code: APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USER_QUERY,
                  error: new Error('invalid mysql query response'),
                }),
              );
            }
            let user = undefined;
            if (result.length > 0) {
              user = { ...result[0] };
              delete user.password;
            }
            return resolve({ user });
          });
        } catch (mysqlError) {
          return reject(
            new AppError({
              code: APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USER_QUERY,
              error: mysqlError,
            }),
          );
        }
      });
    },
  };
};
