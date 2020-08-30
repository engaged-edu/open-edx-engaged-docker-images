const joi = require('@hapi/joi');
const moment = require('moment');
const randomstring = require('randomstring');
const { APP_ERROR_CODE } = require('../../constants');

const QUERY_STATEMENT = `
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

const DEFAULT_TOKEN_SCOPE = 'user_id email profile';
const DEFAULT_TOKEN_APPLICATION_ID = 1;
const EXPIRE_TOKEN_IN = {
  AMOUNT: 7,
  UNIT: 'day',
};

/**
 * @param {{mysql: import('mysql').Connection}} params
 */
exports.createOpenEdxUserAccessTokenFactory = ({ mysql, AppError } = {}) => {
  return {
    createOpenEdxUserAccessToken: (params = {}) => {
      return new Promise((resolve, reject) => {
        try {
          /**
           * @type {{ user_id: string }}
           */
          const { user_id } = joi.attempt(
            params,
            joi
              .object({
                user_id: joi.number().integer().positive().required(),
              })
              .required(),
          );
          const now = new Date();
          const expiration = moment(now).add(EXPIRE_TOKEN_IN.AMOUNT, EXPIRE_TOKEN_IN.UNIT).toDate();
          const token = randomstring.generate(30);
          mysql.query(
            QUERY_STATEMENT,
            [token, expiration, DEFAULT_TOKEN_SCOPE, DEFAULT_TOKEN_APPLICATION_ID, user_id, now, now, null],
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
              return resolve({ accessToken: token });
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
