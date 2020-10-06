const joi = require('@hapi/joi');
const { APP_ERROR_CODE } = require('../../constants');

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
          code: APP_ERROR_CODE.EVENT_HANDLE_MYSQL,
          error: handleMySQLEventError,
        });
      }
    },
  };
};
