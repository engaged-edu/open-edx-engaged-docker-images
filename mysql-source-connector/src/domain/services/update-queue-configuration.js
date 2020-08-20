const joi = require('@hapi/joi');
const { APP_ERROR_MESSAGE } = require('../../constants');

exports.updateQueueConfigurationFactory = ({ lowDb, AppError } = {}) => {
  return {
    updateQueueConfiguration: (params = {}) => {
      try {
        const { binlogName, nextPosition } = joi.attempt(
          params,
          joi.object({
            binlogName: joi.string().required(),
            nextPosition: joi.number().positive().integer().required(),
          }),
        );
        return lowDb.set('configuration', { binlogName, nextPosition }).write();
      } catch (updateQueueError) {
        throw new AppError({ message: APP_ERROR_MESSAGE.QUEUE.UPDATE_CONFIG, error: updateQueueError });
      }
    },
  };
};
