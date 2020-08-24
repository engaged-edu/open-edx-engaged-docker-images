const joi = require('@hapi/joi');
const { APP_ERROR_MESSAGE } = require('../../constants');

exports.handleMySQLEventFactory = ({ addEventToQueue, updateQueueConfiguration, AppError } = {}) => {
  return {
    handleMySQLEvent: ({ event } = {}) => {
      try {
        joi.assert(
          event,
          joi
            .object({
              binlogName: joi.string().required(),
              nextPosition: joi.number().positive().integer().required(),
            })
            .unknown()
            .required(),
        );
        addEventToQueue({ event });
        const { nextPosition, binlogName } = event;
        updateQueueConfiguration({ nextPosition, binlogName });
        return;
      } catch (handleMySQLEventError) {
        throw new AppError({
          message: APP_ERROR_MESSAGE.EVENT.HANDLE_MYSQL,
          error: handleMySQLEventError,
        });
      }
    },
  };
};
