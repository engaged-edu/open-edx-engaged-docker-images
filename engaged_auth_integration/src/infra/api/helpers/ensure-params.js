const joi = require('@hapi/joi');

exports.ensureParams = ({ params, schema } = {}, catchError = (err) => { throw err }) => {
  try {
    return joi.attempt(params, joi.object(schema).required());
  } catch (validationError) {
    return catchError(validationError);
  }
};
