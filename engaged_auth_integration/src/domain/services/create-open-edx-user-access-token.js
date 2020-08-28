const joi = require('@hapi/joi');
const randomstring = require('randomstring');
const moment = require('moment');
const { APP_ERROR_CODE } = require('../../constants');

const statement = `
INSERT INTO openedx.oauth2_provider_accesstoken 
(
  token,
  expires,
  scope,
  application_id,
  user_id,
  created,
  updated,
  source_refresh_token_id
) VALUES(?,?,?,?,?,?,?,?)
`.trim();

/**
 * @param {{mysql: import('mysql').Connection}} params
 */
exports.createOpenEdxUserAccessTokenFactory = ({ mysql, AppError } = {}) => {
  return {
    createOpenEdxUserAccessToken: (params = {}) => {
      return new Promise((resolve, reject) => {
        try {
          /**
           * @type {{ user_id: '' }}
           */
          const { user_id } = joi.attempt(
            params,
            joi
              .object({
                user_id: joi.number().required(),
              })
              .required(),
          );
          mysql.query(
            statement,
            [
              randomstring.generate(30),
              moment(moment.now()).add(7, 'day').toDate(),
              'user_id email profile',
              1,
              user_id,
              new Date(),
              new Date(),
              null,
            ],
            (usersQueryError, result) => {
              if (usersQueryError) {
                return reject(
                  new AppError({
                    code: APP_ERROR_CODE.INSERT_OPEN_EDX_AUTH_TOKEN,
                    error: usersQueryError,
                  }),
                );
              }
              if (!result || !result.insertId) {
                return reject(
                  new AppError({
                    code: APP_ERROR_CODE.INSERT_OPEN_EDX_AUTH_TOKEN,
                    error: new Error('invalid mysql query response'),
                  }),
                );
              }
              return resolve({ accessTokenResult: { ...result, token_id: result.insertId } });
            },
          );
        } catch (mysqlError) {
          return reject(
            new AppError({
              code: APP_ERROR_CODE.INSERT_OPEN_EDX_AUTH_TOKEN,
              error: mysqlError,
            }),
          );
        }
      });
    },
  };
};
