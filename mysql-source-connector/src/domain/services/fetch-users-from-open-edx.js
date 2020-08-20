const joi = require('@hapi/joi');
const { APP_ERROR_MESSAGE } = require('../../constants');

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
            joi.object({
              usersId: joi.array().items(joi.number().positive().integer().required()).required(),
            }),
          );
          if (usersId.length === 0) {
            return resolve({ users: [] });
          }
          mysql.query(`select * from auth_user where id IN (${usersId.join(',')})`, (usersQueryError, users) => {
            if (usersQueryError) {
              return reject(
                new AppError({
                  message: APP_ERROR_MESSAGE.OPEN_EDX_MYSQL.FETCH_USERS_QUERY,
                  error: usersQueryError,
                }).flush(),
              );
            }
            if (!Array.isArray(users)) {
              return reject(
                new AppError({
                  message: APP_ERROR_MESSAGE.OPEN_EDX_MYSQL.FETCH_USERS_QUERY,
                  error: new Error('invalid mysql query response'),
                }).flush(),
              );
            }
            return resolve(users.map((user) => ({ ...user })));
          });
        } catch (mysqlError) {
          return reject(
            new AppError({
              message: APP_ERROR_MESSAGE.OPEN_EDX_MYSQL.FETCH_USERS_QUERY,
              error: mysqlError,
            }).flush(),
          );
        }
      });
    },
  };
};
