const joi = require('@hapi/joi');

/**
 * @param {{mysql: import('mysql').Connection}} params
 */
exports.fetchUsersFromOpenEdxFactory = ({ mysql } = {}) => {
  return {
    fetchUsersFromOpenEdx: (params = {}) => {
      return new Promise((resolve, reject) => {
        try {
          /**
           * @type {{ usersId: [] }}
           */
          const { usersId } = joi.attempt(params, {
            usersId: joi.array().items(joi.number().positive().integer().required()).required(),
          });
          if (usersId.length === 0) {
            return resolve({ users: [] });
          }
          mysql.query(`select * from auth_user where id IN (${usersId.join(',')})`, (usersQueryError, users) => {
            if (usersQueryError) {
              return reject(usersQueryError);
            }
            if (!Array.isArray(users)) {
              return reject(new Error('invalid mysql query response'));
            }
            return resolve(users.map((user) => ({ ...user })));
          });
        } catch (error) {
          return reject(error);
        }
      });
    },
  };
};
