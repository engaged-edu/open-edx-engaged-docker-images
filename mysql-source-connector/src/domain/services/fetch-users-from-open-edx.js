const joi = require('@hapi/joi');
const { APP_ERROR_CODE } = require('../../constants');

/**
 * @param {{mysql: import('mysql').Connection}} params
 */
exports.fetchUsersFromOpenEdxFactory = ({ mysql, AppError } = {}) => {
  return {
    fetchUsersFromOpenEdx: (params = {}) => {
      return new Promise((resolve, reject) => {
        try {
          /**
           * @type {{ usersId: [] }}
           */
          const { usersId } = joi.attempt(
            params,
            joi
              .object({
                usersId: joi.array().items(joi.number().positive().integer().required()).required(),
              })
              .required(),
          );
          if (usersId.length === 0) {
            return resolve({ users: [] });
          }
          mysql.query(`select * from auth_user where id IN (${usersId.join(',')})`, (usersQueryError, users) => {
            if (usersQueryError) {
              return reject(
                new AppError({
                  code: APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USERS_QUERY,
                  error: usersQueryError,
                }),
              );
            }
            if (!Array.isArray(users)) {
              return reject(
                new AppError({
                  code: APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USERS_QUERY,
                  error: new Error('invalid mysql query response'),
                }),
              );
            }
            return resolve(users.map((user) => ({ ...user })));
          });
        } catch (mysqlError) {
          return reject(
            new AppError({
              code: APP_ERROR_CODE.OPEN_EDX_MYSQL_FETCH_USERS_QUERY,
              error: mysqlError,
            }),
          );
        }
      });
    },
  };
};
