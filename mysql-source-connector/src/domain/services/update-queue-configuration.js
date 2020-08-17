const joi = require('@hapi/joi');

exports.updateQueueConfigurationFactory = ({ lowDb } = {}) => {
  return {
    updateQueueConfiguration: (params = {}) => {
      const { binlogName, nextPosition } = joi.attempt(params, {
        binlogName: joi.string().required(),
        nextPosition: joi.number().positive().integer().required(),
      });
      return lowDb.set('configuration', { binlogName, nextPosition }).write();
    },
  };
};
