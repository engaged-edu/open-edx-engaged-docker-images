const joi = require('@hapi/joi');

exports.handleMySQLEventFactory = ({ addEventToQueue, updateQueueConfiguration } = {}) => {
  return {
    handleMySQLEvent: ({ event } = {}) => {
      // TODO - envelopar com tratamento de erro
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
    },
  };
};
